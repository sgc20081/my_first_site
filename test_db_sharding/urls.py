from django.urls import path
from django.urls import re_path
from . import views
from django.conf import settings
from django.conf.urls.static import static



urlpatterns = [
    path('', views.index, name='index'),
    path('aaaa', views.index, name='index'),
]