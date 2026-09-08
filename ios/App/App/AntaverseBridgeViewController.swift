import Capacitor

final class AntaverseBridgeViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(AntaverseTimerPlugin())
    }
}
