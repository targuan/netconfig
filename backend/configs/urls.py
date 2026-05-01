from rest_framework.routers import DefaultRouter
from configs.views import DeviceConfigViewSet

router = DefaultRouter()
router.register(r"configs", DeviceConfigViewSet)

urlpatterns = router.urls
