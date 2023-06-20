from django.shortcuts import render
from .forms import *
from .models import *

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

    data_list = TestModelSharding.objects.using('db2').all()

    print(f'data_list {data_list}')

    return render(request, 'db_main.html', {'form': form, 'data_list': data_list})