from django.urls import path
from django.urls import re_path
from . import views
from .templatetags.users_tags import get_comments_tag
from django.conf import settings
from django.conf.urls.static import static



urlpatterns = [
    path('', views.index, name='index'),
    path('log/', views.client_log, name='log')
]   

urlpatterns += [
    re_path(r'^articles\/?$', views.ArticleListView.as_view(), name='articles'),
    re_path(r'^articles/(?P<pk>\d+)\/?$', views.article_detail_view, name='article_text'),
    re_path(r'^article-update/(?P<pk>\d+)\/?$', views.article_update, name='article_update'),
    re_path(r'^article-new\/?$', views.article_new, name='article_new'),
    re_path(r'^article-image-upload\/?$', views.article_image_upload, name='article_image_upload'),

    re_path(r'^forum\/?$', views.ForumListView.as_view(), name='forum'),
    re_path(r'^forum/(?P<pk>\d+)\/?$', views.forum_theme, name='forum_theme'),
    re_path(r'^forum-new\/?$', views.forum_new_theme, name='forum_new_theme'),
    re_path(r'^forum/(?P<forum_id>\d+)/delete-message/(?P<pk>\d+)\/?$', views.delete_forum_message, name='forum_message_delete'),
    re_path(r'^forum/(?P<pk>\d+)/update-message/(?P<message_id>\d+)\/?$', views.forum_theme, name='forum_message_update'),
    
    
    re_path(r'^gallery\/?$', views.GalleryView.gallery_list, name='gallery'),
    re_path(r'^gallery/create\/?$', views.GalleryView.gallery_create, name='gallery_create'),
    re_path(r'^gallery/(?P<username>\w+)\/?$', views.GalleryView.gallery_view, name='gallery_view'),
    re_path(r'^gallery/(?P<username>\w+)/(?P<pk>\d+)\/?$', views.GalleryView.gallery_view, name='gallery_view_image'),
    re_path(r'^gallery/gallery-delete/(?P<pk>\d+)\/?$', views.GalleryView.gallery_delete, name='gallery_delete'),
    re_path(r'^gallery/gallery-image-delete/(?P<pk>\d+)\/?$', views.GalleryView.gallery_image_delete, name='gallery_image_delete'),

    re_path(r'^chat\/?$', views.chat, name='chat'),
    re_path(r'^chat/(?P<room_name>\w+)\/?$', views.chat_room, name='room'),
    re_path(r'^chat-popup/(?P<room_name>\w+)\/?$', views.chat_room, name='chat_room_popup'),
    re_path(r'^chat/(?P<room_name>\w+)/leave_chat_room\/?$', views.leave_chat_room, name='leave_chat_room'),

    re_path(r'^registration\/?$', views.registration, name='registration'),
    re_path(r'^login\/?$', views.user_login, name='user_login'),
    re_path(r'^profile\/?$', views.profile, name='profile'),
    re_path(r'^profile/(?P<username>\w+)\/?$', views.profile, name='user_profile'),
    re_path(r'^profile-update\/?$', views.profile_update, name='profile_update'),
    re_path(r'^profile-update/password_update\/?$', views.password_update, name='password_update'),

    re_path(r'^like\/?$', views.LikeView.like_post, name='like'),

    re_path(r'^comment-new\/?$', views.CommentsView.post_comment, name='comment-new'),
    re_path(r'^comment-reply\/?$', views.CommentsView.comment_reply, name='comment-reply'),
    re_path(r'^comment-delete/(?P<pk>\d+)\/?$', views.CommentsView.comment_delete, name='comment-delete'),

    re_path(r'^notifications\/?$', views.notifications, name='notifications'),

    re_path(r'test/(?P<object>\d+)\/?$', get_comments_tag, name='test')
]