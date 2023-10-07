from django.db import models

class CustomDBManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().using('db_qgraphql_test')

class Actor(models.Model):
    
    name = models.CharField(max_length=100)
    
    def __str__(self):
        return self.name
    
    objects = CustomDBManager()

    def save(self, *args, **kwargs):

        using_db = 'db_qgraphql_test'
        super().save(using=using_db, *args, **kwargs)
    
    class Meta:
        ordering = ('name',)

class Movie(models.Model):
    
    title = models.CharField(max_length=100)
    actors = models.ManyToManyField(Actor, related_name='movies')
    year = models.IntegerField()
    
    def __str__(self):
        return self.title
    
    objects = CustomDBManager()

    def save(self, *args, **kwargs):

        using_db = 'db_qgraphql_test'
        super().save(using=using_db, *args, **kwargs)
    
    class Meta:
        ordering = ('title',)

