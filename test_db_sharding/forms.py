from .models import *
from django import forms

class TestModelShardingForm(forms.ModelForm):

    class Meta:

        model = TestModelSharding
        fields = ['name', 'count']