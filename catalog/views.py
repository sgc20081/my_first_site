from collections import UserString
from multiprocessing import context
from urllib import request
from .models import Forum, ForumMessage, Article, CustomUser, Gallery, Chat, UserChat
from django.views.generic import ListView, View
from django.views.generic import DetailView, CreateView, FormView, UpdateView, DeleteView
from django.views.generic.detail import SingleObjectMixin
from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate
from django.contrib import messages
from .forms import UserRegistrationForm
from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate
from django.shortcuts import get_object_or_404
from django.core.mail import mail_managers
from django.urls import reverse, reverse_lazy
from django.utils import formats
from django.views.generic.edit import FormMixin, DeletionMixin
from .forms import *
from django.contrib.auth.decorators import login_required
from django.views.decorators.clickjacking import xframe_options_sameorigin
import json
from django.http import HttpResponse, JsonResponse
from django.db.models import Max, Min
from django.core.paginator import Paginator
from django.core import serializers
from django.forms.models import model_to_dict
from django.views.decorators.csrf import csrf_exempt

# Create your views here.

def test_online(request):
    return render( request, 'online_test.html')

class ForumListView(ListView):
    model = Forum
    context_object_name = 'forum_list'
    template_name = 'forum.html'

def forum_new_theme(request):

    if request.method == 'POST':
        author = Forum(author=request.user)
        form = ForumForm(request.POST, instance=author)
        if form.is_valid():
            form.save()
            

            messages.success(request, f'Тема создана')    
            return redirect('forum')
    else:
        form = ForumForm()

    return render(
        request,
        'catalog/forum_new_theme.html',
        {'form': form}
    )

def forum_theme(request, *args, **kwargs):
    
    forum_theme = Forum.objects.get(pk=kwargs['pk'])
      
    pagging_list = ForumMessage.objects.all().filter(forum_theme=kwargs['pk'])
    paginator = Paginator(pagging_list, 5)
    page_number = request.GET.get('page')
    # В переменной message_list уже заложен список объектов ForumMessage
    # но с применённым на него объектом Paginator
    message_list = paginator.get_page(page_number)
    message = ''
    
    if 'page' in request.GET:
        page = request.GET['page']
    else:
        page = ''

    if request.path_info.find('update-message') != -1:

        message = ForumMessage.objects.get(pk=kwargs['message_id'])
        form = ForumMessageForm(request.POST)
        
        form.instance.author = message.author
        form.instance.message = message.message
        form.instance.forum_theme = message.forum_theme
        form.instance.publish_time = message.publish_time
        form.instance.id = message.id
        
        if message.author == request.user:

            if form.is_valid():
                form.save()
                return redirect('/catalog/forum/'
                    + kwargs['pk']
                    +'?page='+page
                    +'#forum_message_main_'+str(message.id))
    
    else:
        if request.method == 'POST':
            form = ForumMessageForm(request.POST)
            form.instance.forum_theme = Forum.objects.get(pk=kwargs['pk'])
            form.instance.author = request.user
            if form.is_valid():
                form.save()

                return redirect('/catalog/forum/'+ kwargs['pk']+'?page='+str(paginator.num_pages))
        else:
            form = ForumMessageForm()

    return render(request, 
        'catalog/forum_theme.html', 
        {'forum': forum_theme,
        'message_list': message_list,
        'message': message,
        'form': form,
        'page': page}
    )

def delete_forum_message(request, forum_id, pk):

    if request.method == 'GET':
        if ForumMessage.objects.get(pk=pk).author == request.user:
            ForumMessage.objects.filter(pk=pk).delete()
            # Редирект на предыдущую страницу
            return redirect(request.META.get('HTTP_REFERER'))
    
    return redirect('/catalog/forum/'+ forum_id)

class ArticleListView(ListView):
    model = Article
    context_object_name = 'article_list'
    template_name='articles.html'

class ArticleDetailView(DetailView):
    model = Article
    template_name='catalog/article_text.html'

class GalleryView:
    
    def gallery_list(request, *args, **kwargs):

        gallery_list = Gallery.objects.all()
        if request.user.is_authenticated:
            if Gallery.objects.filter(author=request.user).exists():
                gallery_check = False
            else:
                gallery_check = True

            return render(request, 
                    'gallery_list.html',
                    {'gallery_list': gallery_list,
                    'gallery_check': gallery_check,})
        else:
            return render(request, 
                    'gallery_list.html',
                    {'gallery_list': gallery_list,})

    def gallery_create(request, *args, **kwargs):

        if not Gallery.objects.filter(author=request.user).exists():
            user = CustomUser.objects.get(pk=request.user.id)
            gallery_form = GalleryForm(request.POST)
            gallery_form.instance.author = user

            if gallery_form.is_valid():
                gallery_form.save()
                
                return redirect('/catalog/gallery/'+request.user.username)
        
        return redirect('gallery')

    def gallery_view(request, *args, **kwargs):

        gallery = Gallery.objects.get(
                author_id = CustomUser.objects.get(username=kwargs['username']).id)
        gallery_images = GalleryImage.objects.filter(author_id = gallery.author_id)

        if 'image' in request.GET:
            big_img = GalleryImage.objects.filter(pk=request.GET['image'])
        else:
            big_img = GalleryImage.objects.filter(
                author_id = CustomUser.objects.get(username=kwargs['username']).id)

            if big_img.exists():
                big_img = GalleryImage.objects.get(pk=big_img.aggregate(Min('id'))['id__min'])
            else:
                big_img = None

        if request.method == 'POST':
            image_load_form = GalleryImageForm(request.POST, request.FILES)
            image_load_form.instance.allcomments_id = CommentsView.create_comment_object()
            image_load_form.instance.likes_id = LikeView.create_likes_object()
            image_load_form.instance.author = request.user
            image_load_form.instance.gallery_id = Gallery.objects.get(
                    author_id = CustomUser.objects.get(username=kwargs['username']).id).id
            
            if image_load_form.is_valid():
                image_load_form.save()

                return redirect(request.user.username+'/')
        
        else:
            image_load_form = GalleryImageForm(request.POST, request.FILES)

        if request.headers.get('X-Requested-With') == 'XMLHttpRequest' and request.method == 'GET':

            from catalog.templatetags.users_tags import get_comments_tag, get_likes_tag
            
            comments = get_comments_tag(request, GalleryImage.objects.get(pk=request.GET['image']))
            likes = get_likes_tag(request, GalleryImage.objects.get(pk=request.GET['image']))
            big_img = serializers.serialize('json', big_img)
            
            comments_rendder = render(request, 'comments_template.html', {'comments': comments,})
            likes_rendder = render(request, 'likes_template.html', {'likes': likes,})
            
            context = {
                'big_img': big_img,
                'comments_render': comments_rendder.content.decode('utf-8'),
                'likes_render': likes_rendder.content.decode('utf-8')
            }

            return JsonResponse(context)
        
        else:
            
            return render(request, 'gallery_view.html',
                    {'gallery': gallery,
                    'gallery_images': gallery_images, 
                    'image_load_form': image_load_form,
                    'big_img': big_img,
                    })
    
    def gallery_delete(request, *args, **kwargs):

        gallery = Gallery.objects.get(pk=kwargs['pk'])

        if request.method == 'GET':
            if request.user == gallery.author:
                gallery.delete()
            
            return redirect('gallery')
        
        return redirect('gallery')

    def gallery_image_delete(request, *args, **kwargs):

        image = GalleryImage.objects.get(pk=kwargs['pk'])

        if request.method == 'GET':
            if request.user == image.author:
                image.delete()

                return redirect('../'+image.author.username)
        
        return redirect('../'+image.author.username)
        

class CommentsView:

    def create_comment_object():
        
        if AllCommentsOfObject.objects.all().exists():
            comments_id = AllCommentsOfObject.objects.create(pk=AllCommentsOfObject.objects.latest('pk').pk+1).pk
        else:
            comments_id = AllCommentsOfObject.objects.create(pk=1).pk
        
        # Возвращает id только что созданного объекта Comment в int значении (число)
        return comments_id

    def get_comments(request, object_or_allcomments_id, type=''):

        if type == 'id':
            comments = Comment.objects.filter(allcomments_id=object_or_allcomments_id, parent_comm_id=0)
        else:
            comments = Comment.objects.filter(allcomments_id=object_or_allcomments_id.allcomments_id, parent_comm_id=0)
        comments_array = []
        
        for comment in comments:

            comment_dict = {}
            comment_dict['comment'] = comment
            comment_dict['users_like'] = LikeView.get_like_users(comment.likes_id)
            comment_dict['check_user_like'] = LikeView.check_user_like(request, comment.likes_id)
            comments_array.append(comment_dict)

        comments_array = list(filter(None, comments_array))[::-1]

        return comments_array
    
    def post_comment(request, comments_id=0, parent_comm_id=0, *args, **kwargs):
        
        ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
        post = request.method == 'POST'

        if ajax:
            comments_id = request.GET['allcomments_id']
            if 'comm_text' in args:
                comm_text = args['comm_text']
            else:
                comm_text = request.GET['comm_text']

        comment_form = CommentForm(request.POST)
        comment_form.instance.comment_text = comm_text
        comment_form.instance.author = request.user
        comment_form.instance.likes_id = LikeView.create_likes_object()
        comment_form.instance.allcomments = AllCommentsOfObject.objects.get(pk=comments_id)

        if parent_comm_id != 0:
            comment_form.instance.parent_comm_id = Comment.objects.get(pk=parent_comm_id).id
        else:
            comment_form.instance.parent_comm_id = 0

        #comment_form.full_clean()
        if comment_form.is_valid():
            comment_form.save()
        else:
            print('Это форма: ', comment_form)
            print('Форма не отправляется, потому что: ', comment_form.errors)
        
        if ajax:
            from catalog.templatetags.users_tags import get_comments_tag
            comments =  get_comments_tag(request, comments_id, type='id')
            comments_render = render(request, 'comments_template.html', {'comments': comments})

            return JsonResponse({'comments': comments_render.content.decode('utf-8')})
        
        elif post:
            return redirect(request.META.get('HTTP_REFERER'))

    def comment_reply (request, *args, **kwargs):

        ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'

        comments_id = request.GET['allcomments_id']
        parent_comm_id = request.GET['parent_comm_id']
        comm_text = request.GET['comm_text']

        return CommentsView.post_comment(request, comments_id, parent_comm_id, comm_text)

    def comment_delete(request, *args, **kwargs):

        if request.method == 'GET':
            comment = Comment.objects.get(pk=kwargs['pk'])
            if comment.author == request.user:
                comment.delete()

                return redirect(request.META.get('HTTP_REFERER'))

        return redirect('index')    

def article_detail_view(request, *args, **kwargs):

    article = Article.objects.get(pk=kwargs['pk'])
        
    return render(request,
        'catalog/article_text.html',
        {'article': article,})

@xframe_options_sameorigin
def article_image_upload(request):

    if request.method == 'POST':
        image = ArticleImageForm(request.POST, request.FILES)
        if image.is_valid():
            image.save()
                
            messages.success(request, f'Статья создана')    
            return redirect('article_image_upload')
    
    return render(request,
    'catalog/image_upload_frame.html', 
    {'image_src': ArticleImage.objects.latest('id')}
    )

@xframe_options_sameorigin
def article_new(request):

    if request.method == 'POST':
        image = ArticleImageForm(request.POST, request.FILES)
        if image.is_valid():
            image.save()
                
            messages.success(request, f'Статья создана')    
            return redirect('article_image_upload')
    else:
        image = ArticleImageForm()

    if request.method == 'POST':
        form = ArticleForm(request.POST)
        form.instance.author = request.user
        form.instance.likes_id = LikeView.create_likes_object()
        form.instance.allcomments_id = CommentsView.create_comment_object()
        if form.is_valid():
            form.save()

            messages.success(request, f'Статья создана')
            return redirect('articles')
    else:
        form = ArticleForm()        
    return render(request, 'catalog/article_new.html', 
        {'form': form,
        'image': image,}
        )

@xframe_options_sameorigin
def article_update(request, *args, **kwargs):

    if request.method == 'POST':
        image = ArticleImageForm(request.POST, request.FILES)
        if image.is_valid():
            image.save()
                
            messages.success(request, f'Статья создана')    
            return redirect('article_image_upload')
    else:
        image = ArticleImageForm()

    article = Article.objects.get(pk=kwargs['pk'])
    form = ArticleForm(request.POST, instance=article)
    
    if article.author == request.user:
        if request.method == 'POST':
            if form.is_valid():
                form.save()

                return redirect('/catalog/articles/'+kwargs['pk'])
    
    return render(request,
        'catalog/article_update.html',
        {'form': form,
        'article': article,
        'image': image,}
    )

def index(request):

    return render(
        request,
        'index.html',
    )

def articles(request):

    return render(
        request,
        'articles.html',
    )

def chat(request):

    ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'

    if ajax:
        print('Запрос ajax на чат')
        chat = render(request, 'chat.html').content.decode('utf-8')

        return JsonResponse({'chat': chat})

    return render(
        request,
        'chat.html',
    )

def chat_room(request, room_name, *args, **kwargs):
    
    room, create = ChatRoom.objects.get_or_create(chat_room=room_name)
    user_chat, create = UserChat.objects.get_or_create(chat_room=room, user=request.user)

    # Обработка последнего прочитанного сообщения. Если сообщение существует, выводится его id
    # Поиск сообщения по id идёт в текущей комната, чтобы предотвратить ошибку, когда сообщение по id существовало, 
    # но было удалено и его id заняло сообщение из другого чата
    if Chat.objects.filter(pk=user_chat.last_read_msg_id, chat_room_id=room.id).exists():
        last_read_msg_id = user_chat.last_read_msg_id
    # Если сообщение по какой-то причине отсутвует, то берётся последнее сообщение текущего чата
    else:
        last_read_msg_id = Chat.objects.filter(chat_room_id=room.id).aggregate(Max('id'))['id__max']

        user_chat.last_read_msg_id = last_read_msg_id
        user_chat.save()

    if 'last_read_msg' in request.GET:
        last_read_msg_id = int(request.GET['last_read_msg'])
        user_chat.last_read_msg_id = last_read_msg_id

        user_chat.save()

        return JsonResponse({'last_read_msg': last_read_msg_id})

    first_room_msg_id = Chat.objects.filter(chat_room = room).aggregate(Min('id'))['id__min']
    chat_msg = Chat.objects.filter(chat_room_id=room.id)
    
    # Разбивка массива сообщений на части, для их отправки клиенту (чтобы не засорять видимую область и подгружать
    # дополнительные сообщения при необходимости)
    if last_read_msg_id != None:
        if 'load_extra_msg' in request.GET:
            if request.GET['load_extra_msg'] == 'top':
                msg_flag_to_loading_msgs = request.GET['last_msg_id']
                read_chat_msgs = chat_msg.filter(id__lt=msg_flag_to_loading_msgs).order_by('-id')[:30]

        else:
            msg_flag_to_loading_msgs = last_read_msg_id
            # Берём последние 20 сообщений, которые были до последнего прочитанного сообщения, включая его само 
            read_chat_msgs = chat_msg.filter(id__lte=msg_flag_to_loading_msgs).order_by('-id')[:30]
            # Берём все остальные сообщения, которые следуют после последнего прочитанного
            unread_msgs = chat_msg.filter(id__gt=msg_flag_to_loading_msgs).order_by('id')
        
        # Добавляем прочитанные сообщения в список, и разворачиваем его, чтобы сообщения выводились в правильном порядке
        if 'read_chat_msgs' in locals():
            chat_msg = list(reversed(read_chat_msgs))
        else:
            chat_msg = []
    
        # Если у пользователя есть не прочитанные сообщения в данном чате, то мы разбираем объект QuerySet и добавляем
        # по одному экземпляру не прочитанного сообщения в массив к прочитанным
        if 'unread_msgs' in locals(): # Проверка на существование локальной переменной unread_msgs
            if unread_msgs:
                for unread_chat_msg in unread_msgs:
                    chat_msg.append(unread_chat_msg)
    
    else:
        unread_msgs = chat_msg

    # Обработка AJAX запроса на подгрузку дрпронительных прочитанных сообщений
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest' and request.method == 'GET' and 'load_extra_msg' in request.GET:
        
        msg_and_author = []
        for message in chat_msg:
            author = serializers.serialize('json', CustomUser.objects.filter(pk=message.author.id))
            message = serializers.serialize('json', Chat.objects.filter(pk=message.id))
            chat_msg = {'message': message, 'author': author}
            msg_and_author.append(chat_msg)
                
        return JsonResponse({
            'room_name': room_name,
            'chat': msg_and_author,
            'first_room_msg_id': first_room_msg_id,
            'last_read_msg_id': last_read_msg_id,
        })

    # Загрузка страницы комнаты чата
    elif request.headers.get('X-Requested-With') == 'XMLHttpRequest' and request.method == 'GET':
        
        chat_room_html = render(request, 'chat_room.html', {
                        'room_name': room_name,
                        'chat': chat_msg,
                        'unread_msgs': unread_msgs,
                        'first_room_msg_id': first_room_msg_id,
                        'last_read_msg_id': last_read_msg_id,
                        }).content.decode('utf-8')

        return JsonResponse({'chat_room_html': chat_room_html})

    else:
        return render(request, 'chat_room.html', {
            'room_name': room_name,
            'chat': chat_msg,
            'unread_msgs': unread_msgs,
            'first_room_msg_id': first_room_msg_id,
            'last_read_msg_id': last_read_msg_id,
        })

def leave_chat_room(request, room_name, *args, **kwargs):

    #ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    chat_room = ChatRoom.objects.get(chat_room=room_name)

    if UserChat.objects.filter(user=request.user.id, chat_room=chat_room.id).exists():
        user_chat_object = UserChat.objects.get(user=request.user.id, chat_room=chat_room.id)
        user_chat_object.delete()

        if not UserChat.objects.filter(chat_room=chat_room.id).exists():
            chat_room.delete()

        return HttpResponse('User leave the room')

def forum(request):

    return render(
        request,
        'forum.html',
    )

def gallery(request):

    return render(
        request,
        'gallery.html',
    )
 
# Функция регистрации
def home(request):
    return render(request, 'users/home.html')

def registration(request):

    redirect_page = request.GET['next']

    if request.method == 'POST':
        form = UserRegistrationForm(request.POST, request.FILES)
        cd = request.POST

        if 'profile_photo' in request.FILES:
            form.instance.profile_photo = request.FILES['profile_photo']
            form.instance.profile_photo_circle = request.FILES['profile_photo_circle']
        
        form_username = request.POST['username']
        form_email = request.POST['email']
        password1 = request.POST['password1']
        password2 = request.POST['password2']

        if form.is_valid():
            form.save()

            user = authenticate(email=cd['email'], password=cd['password1'])
        
            if user is not None:
                print('Начало авторизации пользователя')
                login(request, user)

            messages.success(request, f'Your account has been created. You can log in now!')    
            return redirect(redirect_page)
        else:
            if CustomUser.objects.filter(username=form_username).exists():
                errors = True
                form.add_error('username', 'Пользователь с таким именем уже существует')
            if CustomUser.objects.filter(email=form_email).exists():
                errors = True
                form.add_error('email', 'Пользователь с таким email уже существует')
            if password1 != password2:
                errors = True
                form.add_error('password1', 'Пароли не совпадают')

            return JsonResponse({'form': render(request, 
                                        'registration/registration.html',
                                        {'form': form}).content.decode('utf-8'),
                                'errors': errors})

    else:
        form = UserRegistrationForm()

    context = {'form': form, 'redirect_page': redirect_page}
    return render(request, 'registration/registration.html', context)

def user_login(request):

    redirect_page = request.GET['next']
    post = request.method == 'POST'
    ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'

    if post:
        print('POST запрос на аутентификацию')
        form = UserLoginForm(request.POST)
        cd = request.POST
        user = authenticate(request, username_or_email=cd['username_or_email'], password=cd['password'])
       
        if user is not None:
            login(request, user)
            redirect = True

        else:
            print('Ошибка аутентификации')
            form.add_error('email', 'Неверные имя пользователя либо пароль')
            form.add_error('password', 'Неверные имя пользователя либо пароль')
            request.path = request.META.get('HTTP_REFERER')

            redirect = False

        login_form = render(request,
            'registration/login.html',
            {'form': form,
            'redirect_page': redirect_page}).content.decode('utf-8')

        return JsonResponse({'login_form': login_form,
                            'redirect': redirect})

    elif ajax:

        form = UserLoginForm()
        login_form = render(request, 
                'registration/login.html',
                {'form': form,
                'redirect_page': redirect_page}).content.decode('utf-8')
        
        return JsonResponse({'login_form': login_form})

    else:
        form = UserLoginForm()
    
    return render(request, 
        'registration/login.html',
        {'form': form,
         'redirect_page': redirect_page})

def profile(request, *args, **kwargs):

    if 'username' in kwargs:
        user = CustomUser.objects.get(username=kwargs['username'])
    else:
        user = request.user

    articles = Article.objects.filter(author=user.id)
    gallery = Gallery.objects.filter(author=user.id)
    forum_themes = Forum.objects.filter(author=user.id)
    
    return render(request, 
                  'user_profile.html',
                  {'user_profile': user,
                   'articles': articles,
                   'gallery': gallery,
                   'forum_themes': forum_themes})

@login_required
def profile_update(request, *args, **kwargs):

    user = request.user
    ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    
    if ajax and request.method == 'POST':

        print('ПОСТУПИЛ ЗАПРОС, СВЯЗАННЫЙ С ОБНОВЛЕНИЙ ИНФОРМАЦИИ О ПРОФИЛЕ')

        form = UserUpdateProfileForm(request.POST, request.FILES, instance=request.user)
        
        if 'profile_photo' in request.FILES:
            form.instance.profile_photo = request.FILES['profile_photo']
            form.instance.profile_photo_circle = request.FILES['profile_photo_circle']

            profile_photo = request.FILES['profile_photo'].name
            profile_photo_path = user_profile_photo_directory_path(request.user, profile_photo)
            profile_photo_full_path = settings.MEDIA_ROOT.replace('\\', '/')+profile_photo_path

            profile_photo_circle = request.FILES['profile_photo_circle'].name
            profile_photo_circle_path = user_profile_photo_circle_directory_path(request.user, profile_photo_circle)
            profile_photo_circle_full_path = settings.MEDIA_ROOT.replace('\\', '/')+profile_photo_circle_path

        form_username = request.POST['username']
        
        if not CustomUser.objects.filter(username=form_username).exists() or form_username == request.user.username:     
            if form.is_valid:
                if 'profile_photo' in locals():
                    if os.path.isfile(profile_photo_full_path):
                        os.remove(profile_photo_full_path)

                    if os.path.isfile(profile_photo_circle_full_path):
                        os.remove(profile_photo_circle_full_path)

                form.save()
                errors = False
                
                return redirect('/catalog/profile')
            else:
                print('Ошибка в данных формы: ', form.errors)
        else:
            errors = True
            form.add_error('username', 'Пользователь с таким именем уже существует')

            return JsonResponse({'form': render(request, 
                                        'registration/profile_update.html',
                                        {'form': form,
                                        'user': user}).content.decode('utf-8'),
                                'errors': errors})
    else:
        form = UserUpdateProfileForm()
    
    return render(request, 
                  'registration/profile_update.html',
                  {'form': form,
                   'user': user})

def password_update(request, *args, **kwargs):
   
    if request.method == 'POST':
        user_pass = request.POST['old_password']
        pass1 = request.POST['password1']
        pass2 = request.POST['password2']
        print(user_pass)
        form = UserChangePasswordForm(request.POST)
        if request.user.check_password(user_pass):
            print('Пароль верный')
            if pass1 == pass2:
                print('Пароли совпадают')
                request.user.set_password(pass1)
                request.user.save()
                return redirect('login')
            else:
                form.add_error('password1', 'Пароли не совпадают')
                print('Пароли не совпадают')
        else:
            print('Пароль не верный')
            form.add_error('old_password', 'Пароль не верный')
    else:
        form = UserChangePasswordForm()

    return render(request, 
                  'registration/password_update.html',
                  {'form': form})

class LikeView: 
    
    # Вызывается при создании нового экземпляра объекта, на котором нужны лайки.
    # Cоздаёт новый экземпляр объекта Like в БД
    def create_likes_object():

        # Проверка на наличие экземпляров объекта Like
        # если True, то создаётся новый экземпляр с id+1 от последнего экземпляра Like
        # если False, то создаётся первый экземпляр
        if Like.objects.all().exists():
            like_id = Like.objects.create(pk=Like.objects.latest('pk').pk+1, likes='').pk
        else:
            like_id = Like.objects.create(pk=1, likes='').pk
        
        # Возвращает id только что созданного объекта Like в int значении (число)
        return like_id

    # Используется для получения строки с id пользователей из БД и преобразования её в массив
    # экземпляров объекта CustomUser
    # Возвращает словарь лайкнувших пользователей и количество лайков на 
    def get_like_users(like_id):

        likes = Like.objects.get(pk=like_id).likes
        likes_array = list(filter(None, likes.split(',')))
        users = []
        
        for user_id in likes_array:
            users.append(CustomUser.objects.get(pk=user_id))
        
        number_of_likes = len(users)

        return {'users': users, 'number_of_likes': number_of_likes}
    
    # Метод используется для отправки True/False в HTML шаблон для визуального отображения
    # условия поставил лайк/не поставил лайк пользователь
    def check_user_like(request, like_id):
        
        like_object = Like.objects.get(pk=like_id)
        likes = like_object.likes

        if str(request.user.id) in likes:
            # Если пользователь уже лайкнул, возращает True (используется для визуального офрмления)
            user_liked = True
        else:
            # Если пользователь ещё не лайкнул, возращает False (используется для визуального офрмления)
            user_liked = False
        
        return user_liked
    
    # При отправке POST запроса получает Like объект и добавляет в строку id пользователя,
    # который отправил POST запрос (лайкнул)
    def like_post(request, *args, **kwargs):
        # Идёт запрос по получению объекта Like по pk из url
        # pk в url должен передаваться из HTML шаблона объекта, который использует Like
        # В шаблон объекта pk должен передаваться из view объекта, который использует Like 
        # pk в view получается при использовании метода create_likes_object()
        
        id = request.GET['like_id']
        like_object = Like.objects.get(pk=id)
        likes = like_object.likes
        
        if request.user.is_authenticated:
            # Проверка на наличие пользователя в списке лайкнувших
            if str(request.user.id) in likes:
                # Если пользователь уже лайкнул, возращает True (используется для визуального офрмления)
                user_liked = True
                # Если уже лайкнул, лайк удаляется
                likes = likes.replace(str(request.user.id)+',', '')
            else:
                # Если пользователь ещё не лайкнул, возращает False (используется для визуального офрмления)
                user_liked = False
                # Если не лайкнул, id пользователя добавляется к лайкнувшим
                likes += str(request.user.id) + ','

        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':

            # Обращаемся к форме POST запроса
            form = LikeForm(request.POST)
            # Включаем в форму данные уже имеющиющиеся строку с id лайкнувших
            # и id экземпляра Like с которым работаем 
            form.instance.likes = likes
            form.instance.id = id
            if form.is_valid():
                form.save()

                from catalog.templatetags.users_tags import get_likes_tag

                likes = get_likes_tag(request, id)
                likes_html = render(request, 'likes_template.html', {'likes': likes}).content.decode('utf-8')

                return JsonResponse({'likes_html': likes_html})
            
        if request.method == 'POST':
            # Обращаемся к форме POST запроса
            form = LikeForm(request.POST)
            # Включаем в форму данные уже имеющиющиеся строку с id лайкнувших
            # и id экземпляра Like с которым работаем 
            form.instance.likes = likes
            form.instance.id = id
            if form.is_valid():
                form.save()
        
                # Возвращает на страницу объекта, который использует Like
                return redirect(request.META.get('HTTP_REFERER'))

def notifications(request, *args, **kwargs):
    print('ПОСТУПИЛ ЗАПРОС ОТ КЛИЕНТА')
    ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'

    if ajax and request.method == 'GET':

        user = request.user

        if not user.is_authenticated:
            return HttpResponse(content='Пользователь не аутентифицирован')

        user_chats = UserChat.objects.filter(user=user)
        chats = []
        
        print('НАЧИНАЮ СБОРКУ ИНФОРМАЦИИ О НЕПРОЧИТАННЫХ СООБЩЕНИЯХ')
        for user_chat in user_chats:
            chat = {}
            chat['chat_room'] = user_chat.chat_room.chat_room
            if user_chat.last_read_msg_id != None:
                chat['unread_msgs_count'] = Chat.objects.filter(chat_room=user_chat.chat_room, id__gt=user_chat.last_read_msg_id).count()
            else:
                chat['unread_msgs_count'] = Chat.objects.filter(chat_room=user_chat.chat_room).count()

            chats.append(chat)
            print('=== НЕПРОЧИТАННЫЕ СООБЩЕНИЯ ИЗ ЧАТА СОБРАНЫ ===')

        chats = json.dumps(chats)
        print('УШЁЛ ОТВЕТ ОТ СЕРВЕРА К КЛИЕНТУ')
        return JsonResponse({'chats': chats})



import logging

# Настройка логгера
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

# Создание обработчика для записи в файл
file_handler = logging.FileHandler('log.txt')
file_handler.setLevel(logging.DEBUG)

# Создание форматировщика для лог-записей
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
file_handler.setFormatter(formatter)

# Добавление обработчика к логгеру
logger.addHandler(file_handler)


@csrf_exempt
def client_log(request, *args, **kwargs):

    #print('====ВЫВОДЯТСЯ СООБЩЕНИЯ КОНСОЛИ БРАУЗЕРА')
    #print('====REQUEST запрос: ', request.body)
    #print('====GET запрос: ', request.GET)
    data = json.loads(request.body)
    logger.debug(data)
    print('================POST запрос: ', data)
    #print('====args, kwargs запрос: ', args, kwargs)