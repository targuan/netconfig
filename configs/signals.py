from django.db.models.signals import post_save
from django.dispatch import receiver
from configs.models import DeviceConfig
from tasks.models import Task

@receiver(post_save, sender=DeviceConfig)
def create_task_on_config_save(sender, instance, created, **kwargs):
    # Requirement: Create automatically a Task with status "pending_approval"
    # both on creation and modification of DeviceConfig.
    # Note: If it's a modification, we might want to ensure we don't create duplicate tasks
    # if one is already pending, but the requirement says "lors de la création ou modification".
    Task.objects.create(
        device=instance.device,
        config=instance,
        status="pending_approval"
    )
