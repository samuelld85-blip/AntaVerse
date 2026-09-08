import ActivityKit
import Capacitor
import UserNotifications

@objc(AntaverseTimerPlugin)
public class AntaverseTimerPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "AntaverseTimer"
    public let jsName = "AntaverseTimer"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "start", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stop", returnType: CAPPluginReturnPromise),
    ]

    private let legacyNotificationIdentifier = "antaverse-rest-timer"

    @objc func start(_ call: CAPPluginCall) {
        guard let milliseconds = call.getDouble("endsAt"), milliseconds > Date().timeIntervalSince1970 * 1000 else {
            call.reject("Le chronomètre doit se terminer dans le futur.")
            return
        }

        let endsAt = Date(timeIntervalSince1970: milliseconds / 1000)
        let title = call.getString("title") ?? "AntaVerse · Repos"

        if #available(iOS 16.1, *) {
            Task {
                guard ActivityAuthorizationInfo().areActivitiesEnabled else {
                    call.resolve(["supported": false])
                    return
                }

                await endAllActivities()
                do {
                    let attributes = RestTimerAttributes(title: title)
                    let state = RestTimerAttributes.ContentState(endsAt: endsAt)
                    let content = ActivityContent(state: state, staleDate: endsAt)
                    _ = try Activity<RestTimerAttributes>.request(
                        attributes: attributes,
                        content: content,
                        pushType: nil
                    )
                    call.resolve(["supported": true])
                } catch {
                    call.reject("Impossible d’afficher le chronomètre système.", "LIVE_ACTIVITY_ERROR", error)
                }
            }
            return
        }

        // iOS 15 has no Live Activities. Do not replace the system surface with
        // a regular alert: the product behavior is a quiet, persistent timer.
        call.resolve(["supported": false])
    }

    @objc func stop(_ call: CAPPluginCall) {
        if #available(iOS 16.1, *) {
            Task { await endAllActivities() }
        }
        let center = UNUserNotificationCenter.current()
        center.removePendingNotificationRequests(withIdentifiers: [legacyNotificationIdentifier])
        center.removeDeliveredNotifications(withIdentifiers: [legacyNotificationIdentifier])
        call.resolve()
    }

    @available(iOS 16.1, *)
    private func endAllActivities() async {
        for activity in Activity<RestTimerAttributes>.activities {
            await activity.end(nil, dismissalPolicy: .immediate)
        }
    }

}
