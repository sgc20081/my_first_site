from django.urls import path
from graphene_django.views import GraphQLView
from .schema import schema
from . import views

urlpatterns = [
    #path('graphql/', GraphQLView.as_view(graphiql=True, schema=schema)),
    path('create_movie/', views.create_movie, name='create_movie'),
]