from rest_framework import serializers
from configs.models import DeviceConfig

class DeviceConfigSerializer(serializers.ModelSerializer):
    version = serializers.IntegerField(read_only=True)

    class Meta:
        model = DeviceConfig
        fields = "__all__"
