from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from devices.models import Device
from configs.models import DeviceConfig
from tasks.models import Task

class NetworkManagerTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.device = Device.objects.create(
            name="Test-SW",
            ip_address="1.1.1.1",
            vendor="Cisco",
            napalm_driver="ios",
            username="admin",
            password="pwd"
        )

    def test_create_config_creates_task(self):
        url = reverse("deviceconfig-list")
        data = {
            "device": self.device.id,
            "content": "interface Gi0/1\n description Test"
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Check if Task was created
        self.assertEqual(Task.objects.count(), 1)
        task = Task.objects.first()
        self.assertEqual(task.status, "pending_approval")
        self.assertEqual(task.device, self.device)

    def test_task_workflow(self):
        config = DeviceConfig.objects.create(
            device=self.device,
            content="test config"
        )
        # Signal should have created a task
        task = Task.objects.get(config=config)

        # Approve
        url = reverse("task-approve", args=[task.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        task.refresh_from_db()
        self.assertEqual(task.status, "approved")

        # Queue
        url = reverse("task-queue", args=[task.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        task.refresh_from_db()
        self.assertEqual(task.status, "queued")

        # Run
        url = reverse("task-run", args=[task.id])
        # Mock random failure to ensure success for testing
        import unittest.mock as mock
        with mock.patch("random.random", return_value=0.5):
            response = self.client.post(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        task.refresh_from_db()
        self.assertEqual(task.status, "success")
        self.assertIn("Connection established", task.logs)

    def test_config_versioning(self):
        # First config should be v1
        config1 = DeviceConfig.objects.create(device=self.device, content="v1")
        self.assertEqual(config1.version, 1)

        # Second config should be v2
        config2 = DeviceConfig.objects.create(device=self.device, content="v2")
        self.assertEqual(config2.version, 2)

    def test_run_not_queued_fails(self):
        config = DeviceConfig.objects.create(
            device=self.device,
            content="test config"
        )
        task = Task.objects.get(config=config)

        # Try to run directly from pending_approval
        url = reverse("task-run", args=[task.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "Only queued tasks can be run")
