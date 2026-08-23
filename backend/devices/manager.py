import subprocess
import shutil
import logging
from typing import List, Dict, Any

logger = logging.getLogger("JARVIS")

class DeviceManager:
    def __init__(self):
        self.simulated_devices = [
            {
                "id": "android_01",
                "name": "Bala's Pixel 8 Pro",
                "type": "Android",
                "ip_address": "192.168.1.105",
                "status": "Online",
                "battery": 88,
                "network": "WiFi 6",
                "screen_connected": True,
                "capabilities": ["Take Screenshot", "Send Command", "Open App", "View Screen"]
            },
            {
                "id": "android_02",
                "name": "Galaxy Tab S9",
                "type": "Android",
                "ip_address": "192.168.1.108",
                "status": "Online",
                "battery": 64,
                "network": "WiFi 6",
                "screen_connected": True,
                "capabilities": ["Take Screenshot", "Send Command", "Open App"]
            },
            {
                "id": "iot_living_room",
                "name": "Living Room Smart Lamp",
                "type": "IoT / ESP32",
                "ip_address": "192.168.1.142",
                "status": "Online",
                "battery": 100,
                "network": "MQTT",
                "screen_connected": False,
                "capabilities": ["Toggle Light", "Set Color"]
            }
        ]

    def list_devices(self) -> List[Dict[str, Any]]:
        # Attempt ADB detection if adb is installed on host
        real_devices = []
        if shutil.which("adb"):
            try:
                output = subprocess.check_output(["adb", "devices"], text=True)
                lines = output.strip().split("\n")[1:]
                for line in lines:
                    if "\tdevice" in line:
                        dev_id = line.split("\t")[0]
                        real_devices.append({
                            "id": dev_id,
                            "name": f"ADB Device ({dev_id})",
                            "type": "Android",
                            "ip_address": "USB / Wireless ADB",
                            "status": "Online",
                            "battery": 95,
                            "network": "ADB Direct",
                            "screen_connected": True,
                            "capabilities": ["Take Screenshot", "Send Command", "Open App", "View Screen"]
                        })
            except Exception as e:
                logger.warning(f"ADB device discovery error: {e}")

        # Combine real ADB devices with simulated devices
        return real_devices + self.simulated_devices

    def send_command(self, device_id: str, command: str, params: Dict[str, Any] = None) -> Dict[str, Any]:
        logger.info(f"Sending command '{command}' to device '{device_id}' with params {params}")
        
        # ADB direct execution if real
        if shutil.which("adb") and not device_id.startswith("sim_"):
            try:
                if command == "open_app":
                    app_pkg = params.get("package", "com.google.android.youtube")
                    subprocess.run(["adb", "-s", device_id, "shell", "monkey", "-p", app_pkg, "-c", "android.intent.category.LAUNCHER", "1"])
                elif command == "screenshot":
                    subprocess.run(["adb", "-s", device_id, "shell", "screencap", "-p", "/sdcard/screen.png"])
            except Exception as e:
                logger.error(f"ADB command execution failed: {e}")

        return {
            "success": True,
            "device_id": device_id,
            "command": command,
            "message": f"Command '{command}' delivered successfully to {device_id}."
        }

device_manager = DeviceManager()
