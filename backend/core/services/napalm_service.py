import time

class NapalmSimulator:
    def __init__(self, device):
        self.device = device
        self.logs = []

    def connect(self):
        self.add_log(f"Connecting to {self.device.ip_address} using {self.device.napalm_driver} driver...")
        time.sleep(1)
        self.add_log(f"Successfully connected to {self.device.name}.")

    def load_replace_candidate(self, config_content):
        self.add_log("Loading configuration candidate...")
        time.sleep(1)
        self.add_log("Configuration candidate loaded successfully.")
        self.add_log("--- CONFIG START ---")
        self.add_log(config_content)
        self.add_log("--- CONFIG END ---")

    def commit_config(self):
        self.add_log("Committing configuration...")
        time.sleep(2)
        self.add_log("Configuration committed successfully.")

    def add_log(self, message):
        timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
        self.logs.append(f"[{timestamp}] {message}")

    def get_logs(self):
        return "\n".join(self.logs)

    def close(self):
        self.add_log("Closing connection.")
