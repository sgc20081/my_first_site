from django.db import models

# Create your models here.

class TestModelSharding(models.Model):

    name = models.CharField(max_length=100)
    count = models.IntegerField()

    def save(self, *args, **kwargs):

        using_db = 'db2'
        super().save(using=using_db, *args, **kwargs)