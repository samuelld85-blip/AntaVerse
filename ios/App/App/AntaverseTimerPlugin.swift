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

    @objc func start(_ call: CAPPluginCall) {
        guard let milliseconds = call.getDouble("endsAt"), milliseconds > Date().timeIntervalSince1970 * 1000 else {
            call.reject("Le chronomètre doit se terminer dans le futur.")
            return
        }

        let endsAt = Date(timeIntervalSince1970: milliseconds / 1000)
        let title = call.getString("title") ?? "AntaVerse · Repos"

        if #available(iOS 16.1, *) {
            Task {
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

        scheduleFallbackNotification(title: title, endsAt: endsAt)
        call.resolve(["supported": false])
    }

    @objc func stop(_ call: CAPPluginCall) {
        if #available(iOS 16.1, *) {
            Task { await endAllActivities() }
        }
        UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: ["antaverse-rest-timer"])
        call.resolve()
    }

    @available(iOS 16.1, *)
    private func endAllActivities() async {
        for activity in Activity<RestTimerAttributes>.activities {
            await activity.end(nil, dismissalPolicy: .immediate)
        }
    }

    private func scheduleFallbackNotification(title: String, endsAt: Date) {
        let center = UNUserNotificationCenter.current()
        center.requestAuthorization(options: [.alert, .sound]) { granted, _ in
            guard granted else { return }
            let content = UNMutableNotificationContent()
            content.title = title
            content.body = "Votre repos est terminé."
            content.sound = .default
            let seconds = max(1, endsAt.timeIntervalSinceNow)
            let trigger = UNTimeIntervalNotificationTrigger(timeInterval: seconds, repeats: false)
            let request = UNNotificationRequest(identifier: "antaverse-rest-timer", content: content, trigger: trigger)
            center.add(request)
        }
    }
}
