from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Customer

@receiver(post_save, sender=Customer)
def update_customer_index(sender, instance, **kwargs):
    # Проведите индексацию для данного объекта
    instance.customerdocument.save()

# В файле apps.py вашего приложения
from django.apps import AppConfig

class TestElasticSearchAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'test_elasticSearch'

    def ready(self):
        import test_elasticSearch.signals  # Импортируйте файл signals.py вашего приложения
