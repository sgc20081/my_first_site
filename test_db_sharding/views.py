from django.shortcuts import render
from .forms import *

# Create your views here.

def index (request, *args, **kwargs):

    if request.method == 'POST':
        form = TestModelShardingForm(request.POST)
        if form.is_valid():
            form.save()
        else:
            print('Форма не валидна')
            print(form.errors)

    else:
        form = TestModelShardingForm()

    return render(request, 'db_main.html', {'form': form})