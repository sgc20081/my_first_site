# Ваш файл views.py
from django.shortcuts import render, redirect
from django.http import JsonResponse
from .forms import GraphQLMovieForm
import requests
from django.middleware.csrf import get_token
from django.core import serializers

def create_movie(request):
    if request.method == 'POST':
        form = GraphQLMovieForm(request.POST)
        if form.is_valid():
            # Получите данные из формы
            title = form.cleaned_data['title']
            actors = form.cleaned_data['actors']
            year = int(form.cleaned_data['year'])

            actors_query = ''
            for actor in actors:
                actors_query += '{id: %s}' %(actor.id)
                        
            # Создайте GraphQL-запрос для создания статьи
            graphql_query = """
            mutation createMovie {  
                createMovie(input: {
                    title: "%s",
                    actors: [%s],
                    year: %s
                }) {
                    ok
                    movie{
                    id
                    title
                    actors {
                        id
                        name
                    }
                    year
                    }
                }
            }
            """ % (title, actors_query, year)

            print('================================================================')
            print(f"GraphQL query: {graphql_query}")

            csrf_token = request.POST['csrfmiddlewaretoken']
            csrf_token_function = get_token(request)
            csrf_token_cookies = request.COOKIES['csrftoken']

            headers = {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrf_token_cookies  # Включите CSRF-токен в заголовке
            }

            # Отправьте GraphQL-запрос к вашему серверу GraphQL
            response = requests.post('http://localhost:8000/graphql/', json={'query': graphql_query}, headers=headers)

            html_response = ''
            for x in response:
                html_response += str(x)
            
            if response.status_code == 200:
                # Запрос успешен, можно предоставить пользователю подтверждение
                return JsonResponse({'success': True, 'message': 'Статья успешно создана.'})
            else:
                # Запрос завершился с ошибкой, обработайте ошибку
                return render(request, 'article_form.html', {
                                    'success': False, 
                                    'message': 'Произошла ошибка при создании статьи.',
                                    'response_status': html_response, 
                                    'status': response.status_code,
                                    'request_body': csrf_token,
                                    'csrf_token_function': csrf_token_function,
                                    'csrf_token_cookies': csrf_token_cookies})
            """    
                return JsonResponse({'success': False, 
                                     'message': 'Произошла ошибка при создании статьи.',
                                     'response_status': html_response, 
                                     'status': response.status_code,
                                     'request_body': csrf_token,
                                     'csrf_token_function': csrf_token_function})
            """
    else:
        # Если это GET-запрос, отобразите форму для пользователя
        form = GraphQLMovieForm()

    return render(request, 'article_form.html', {'form': form})