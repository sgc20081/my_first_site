from django import template
import sys

# Тут идёт проверка, был ли модуль users_tags импортирован напрямую или через другой модуль
# Это необходимо для избежания цикличности импорта при импорте этого модуля в другой, который
# например тут при импорте этого модуля в модуль views, мы продолжаем из этого модуля импортировать views, который в свою очередь
# снова импортирует этот модуль и т.д. до бесконечности 
if 'catalog.templatetags.users_tags' in sys.modules:
    from ..views import CommentsView, LikeView
    from ..models import Comment, GalleryImage
    from ..forms import CommentForm
    from urllib import request

register = template.Library()

@register.simple_tag
def get_likes_tag(request, object):

    # В этом случае идёт проверка, передается ли функция непосредственно id объекта Like в виде строки
    if isinstance(object, str):
        users_likes = LikeView.get_like_users(object)['users']
        number_of_likes = LikeView.get_like_users(object)['number_of_likes']
        user_liked = LikeView.check_user_like(request, object)
        id = object
    else:    
        users_likes = LikeView.get_like_users(object.likes_id)['users']
        number_of_likes = LikeView.get_like_users(object.likes_id)['number_of_likes']
        user_liked = LikeView.check_user_like(request, object.likes_id)
        id = object.likes_id

    return {'object': object,
            'id': id,
            'users_likes': users_likes,
            'number_of_likes': number_of_likes,
            'user_liked': user_liked}

@register.simple_tag
def get_comments_tag(request, object_or_allcomments_id, type=''):

    comment_form = CommentForm()
    comments = CommentsView.get_comments(request, object_or_allcomments_id, type)

    if isinstance(object_or_allcomments_id, str):
        allcomments_id = object_or_allcomments_id
    else: 
        allcomments_id = object_or_allcomments_id.allcomments_id
    return {'comment_form': comment_form,
            'comments': comments,
            'allcomments_id': allcomments_id}

@register.simple_tag
def while_child(request, parent):
    childs_array = []

    def while_child_recursion(request, parent):

        child_comments = Comment.objects.filter(parent_comm_id=parent.id)
                
        for child in child_comments:
            child = comment_in_array(request, child)
            if child['childs']:
                childs_array.append(child)
                for each_child in child['childs']:
                    childs_array.append(comment_in_array(request, each_child))
                    while_child_recursion(request, each_child)
            else:    
                childs_array.append(child)

    if childs_array == []:
        while_child_recursion(request, parent)
    childs_array = list(filter(None, childs_array))
    return childs_array

def comment_in_array(request, child):
    comment_dict = {}
    comment_dict['comment'] = child
    comment_dict['users_like'] = LikeView.get_like_users(child.likes_id)
    comment_dict['check_user_like'] = LikeView.check_user_like(request, like_id=child.likes_id)
    comment_dict['childs'] = Comment.objects.filter(parent_comm_id=child.id)
    comment_dict['parent_comm'] = Comment.objects.get(pk=child.parent_comm_id)

    return comment_dict

@register.simple_tag
def format_time(time):

    if str(type(time)) == "<class 'datetime.datetime'>":
        format_time = time.strftime("%d.%m.%Y %H:%M")
        return format_time
    else:
        format_time = time.strftime("%d.%m.%Y")
        return format_time

@register.simple_tag
def default_photo_check(user):

    print('ФОТО ЮЗЕРА: ', user.profile_photo)
    if user.profile_photo != 'static/images/design/login_icon.svg':
        return True
    else:
        return False