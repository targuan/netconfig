from rest_framework.routers import DefaultRouter
from devices.views import DeviceViewSet

router = DefaultRouter()
router.register(r"devices", DeviceViewSet)

urlpatterns = router.urls
