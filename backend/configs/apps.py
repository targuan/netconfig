from django.apps import AppConfig

class ConfigsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "configs"

    def ready(self):
        import configs.signals
