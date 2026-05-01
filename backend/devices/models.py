import uuid
from django.db import models

class Device(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    ip_address = models.GenericIPAddressField()
    vendor = models.CharField(max_length=100)
    napalm_driver = models.CharField(max_length=100)  # e.g., ios, eos, nxos
    username = models.CharField(max_length=255)
    password = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.ip_address})"
