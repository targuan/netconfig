from rest_framework import serializers
from tasks.models import Task

class TaskSerializer(serializers.ModelSerializer):
    device_name = serializers.CharField(source="device.name", read_only=True)

    class Meta:
        model = Task
        fields = "__all__"
        read_only_fields = ["status", "progress", "logs", "device", "config"]

