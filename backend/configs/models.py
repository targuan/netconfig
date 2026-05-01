import uuid
from django.db import models
from devices.models import Device

class DeviceConfig(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    device = models.ForeignKey(Device, on_delete=models.CASCADE, related_name="configs")
    content = models.TextField()
    version = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-version"]

    def save(self, *args, **kwargs):
        if self._state.adding:
            last_config = DeviceConfig.objects.filter(device=self.device).order_by("-version").first()
            if last_config:
                self.version = last_config.version + 1
            else:
                self.version = 1
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Config v{self.version} for {self.device.name}"
