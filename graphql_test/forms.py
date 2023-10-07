from .models import *
from django import forms

class GraphQLMovieForm(forms.ModelForm):

    actors = forms.ModelMultipleChoiceField(
        queryset=Actor.objects.all(),
        widget=forms.CheckboxSelectMultiple,  # Виджет для выбора нескольких актеров
    )

    class Meta:

        model = Movie
        fields = '__all__'