import time
import random
import difflib

class FakeNAPALMDriver:
    def __init__(self, device, running_config=None):
        self.device = device
        self.logs = []
        self.candidate_config = None
        self.running_config = running_config or "hostname old-device\ninterface GigabitEthernet1\n  description initial config"

    def add_log(self, message):
        timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
        self.logs.append(f"[{timestamp}] {message}")

    def open(self):
        self.add_log(f"Opening connection to device {self.device.ip_address}")
        time.sleep(random.uniform(0.5, 1.5))
        # Simulation of connection failure (part of the 20% total failure chance)
        if random.random() < 0.1:
            self.add_log("Connection timeout")
            raise Exception("Connection timeout")
        self.add_log("Connection established")

    def load_replace_candidate(self, config):
        self.add_log("Loading candidate configuration")
        time.sleep(random.uniform(0.5, 1.0))
        self.candidate_config = config
        self.add_log("Candidate configuration loaded")

    def compare_config(self):
        self.add_log("Comparing configuration")
        time.sleep(random.uniform(0.5, 1.0))

        diff = difflib.unified_diff(
            self.running_config.splitlines(keepends=True),
            self.candidate_config.splitlines(keepends=True),
            fromfile='running-config',
            tofile='candidate-config',
            n=3
        )
        diff_text = "".join(diff)
        if diff_text:
            self.add_log("Diff detected:")
            for line in diff_text.splitlines():
                self.add_log(f"  {line}")
        else:
            self.add_log("No changes detected")
        return diff_text

    def commit_config(self):
        self.add_log("Committing configuration")
        time.sleep(random.uniform(1.0, 2.0))
        # Simulation of commit failure (part of the 20% total failure chance)
        if random.random() < 0.1:
            self.add_log("Commit failed")
            raise Exception("Commit failed")
        self.running_config = self.candidate_config
        self.add_log("Commit successful")

    def close(self):
        self.add_log("Closing connection")
        time.sleep(0.5)

    def get_logs(self):
        return "\n".join(self.logs)
