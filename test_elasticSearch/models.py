from __future__ import unicode_literals
from django.db import models
from django_elasticsearch_dsl import Document
from django_elasticsearch_dsl.registries import registry

from django.utils.decorators import classonlymethod

# Create your models here.

class CustomDBManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().using('db_elasticsearch_test')

customer_type = (
    ("Active", "Active"),
    ("Inactive", "Inactive")
)

class Customer(models.Model):
    id = models.IntegerField(primary_key=True, blank=True)
    first_name = models.CharField(max_length=50, null=False, blank=True)
    last_name = models.CharField(max_length=50, null=False, blank=True)
    other_names = models.CharField(max_length=50, default=" ", blank=True)
    email = models.EmailField(max_length=100, null=True, blank=True)
    phone = models.CharField(max_length=30, null=False, blank=True)
    balance = models.IntegerField(default="0", blank=True)
    customer_status = models.CharField(max_length=100, choices=customer_type, default="Active", blank=True)
    address = models.CharField(max_length=50, null=False, blank=True)

    objects = CustomDBManager()

    def __unicode__(self):
        return "{}:{}".format(self.first_name, self.last_name)

    def save(self, *args, **kwargs):
        using_db = 'db_elasticsearch_test'
        super().save(using=using_db, *args, **kwargs)

@registry.register_document
class CustomerDocument(Document):

    class Index:
        # Name of the Elasticsearch index
        name = 'customers'
        # See Elasticsearch Indices API reference for available settings
        settings = {'number_of_shards': 1,
                    'number_of_replicas': 0}
        
    class Django:
        model = Customer # The model associated with this Document

        # The fields of the model you want to be indexed in Elasticsearch
        fields = [
            'first_name',
            'last_name',
            'other_names',
            'email',
            'phone',
            'balance',
            'customer_status',
            'address',
        ]
    @classonlymethod
    def get_model(self, *args, **kwargs):
        return self.Django.model