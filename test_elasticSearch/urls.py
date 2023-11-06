from django.urls import path
from . import views

urlpatterns = [
    path('', views.CustomerElasticSearchDocumentSearch.as_view),
]