# from django.shortcuts import render
# from .models import Customer, CustomerDocument
# from django.http import HttpResponse

# from elasticsearch_dsl import Search
# from elasticsearch_dsl.connections import connections

from .forms import *
from .models import *

from django.utils.decorators import classonlymethod

from django.shortcuts import render, redirect
from django import forms

from elasticsearch_dsl import Search, Q

# Create your views here.

class ElasticSearchDocumentSearch:

    document = None
    form = None
    template = None

    type = 'match'
    
    def __init__(self, *args, **kwargs):

        self.__request = None
        self.__models_list = None

        if self.document is None:
            raise TypeError(f" <{self.__class__.__name__}> must contain an indexing document")

        if isinstance(self.form(), forms.ModelForm) or isinstance(self.form(), forms.Form):
            request = args[0]
            self.processing_request(request)
        else:
            raise TypeError(f'<{self.__class__.__name__}> must contain a django form')

        if self.template is None:
            raise TypeError(f"<{self.__class__.__name__}> must contain a HTML template")

    def processing_request(self, request, *args, **kwargs):
        form = self.form()
        self.__request = request
        
        if request.method == 'POST':

            form = self.form(request.POST)
            if form.is_valid():

                filter_parameters = {}
                for field, value in form.cleaned_data.items():

                    if value is not None and value is not '':
                        filter_parameters[field] = value

                return self.query_execution(filter_parameters)
        else: 
            return

    def get_model(self, *args, **kwargs):
        return self.document.django.model

    def query_execution(self, filter_parameters, *args, **kwargs):
        #print('Поиск будет осуществляться по данным параметрам: ', filter_parameters)
        must = []
        for field, value in filter_parameters.items():
            query = {}
            query[field] = value
            must.append(Q(self.type, **query))

        s = self.document.search().query('bool', must=must).execute()
        model = self.get_model()
        self.__models_list = []
        
        for hit in s:
            self.__models_list.append(model.objects.get(pk=hit.meta.id))

    @classonlymethod
    def as_view(cls, *args, **kwargs):
        self = cls(*args, **kwargs)
        response_list = {}
        response_list['form'] = self.form

        if self.__models_list is not None and self.__models_list is not []:
            response_list['object'] = self.__models_list
        #print('Response list: ', response_list)
        return render(self.__request,
                        self.template,
                        response_list)

class CustomerElasticSearchDocumentSearch(ElasticSearchDocumentSearch):

    document = CustomerDocument
    form = CustomerForm
    template = 'elasticsearch_form.html'


"""
def search_customers(*args, **kwargs):

    # es = connections.get_connection()

    # Выполняем тестовый запрос
    # response = es.info()

    # print(f'Ответ сервера Elasticsearch: {response}')

    # s1 = Search(index="customers")
    # results = s1.execute()
    # print('Тест по поиску данных: ', results)

    s = CustomerDocument.search().filter("match", first_name="Sergey").execute()

    print('Резултаты??? ', s)

    for hit in s:
        print('Получен один hit: ', hit.to_dict())
"""
"""
from elasticsearch import Elasticsearch

def search_customers(request):
    # Создайте подключение к серверу Elasticsearch
    es = Elasticsearch([{'host': '127.0.0.1', 'port': 9200, 'scheme': 'http'}])

    # Определите ваш поисковый запрос
    search_query = {
        "query": {
            "match": {
                "first_name": "Sergey"
            }
        }
    }

    # Выполните поисковый запрос
    response = es.search(index="customers", body=search_query)
    print('===---=== Результаты: ', response)
    # Обработка результатов
    hits = response.get('hits', {}).get('hits', [])
    results = [hit.get('_source', {}) for hit in hits]

    print('===+++=== Результаты: ', results)
"""