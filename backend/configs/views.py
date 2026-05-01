from rest_framework import viewsets
from configs.models import DeviceConfig
from configs.serializers import DeviceConfigSerializer

class DeviceConfigViewSet(viewsets.ModelViewSet):
    queryset = DeviceConfig.objects.all()
    serializer_class = DeviceConfigSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        device_id = self.request.query_params.get("device_id")
        if device_id:
            queryset = queryset.filter(device_id=device_id)
        return queryset
