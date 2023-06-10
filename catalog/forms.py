from dataclasses import fields
from email.policy import default
from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from .models import *


class UserRegistrationForm(UserCreationForm):
        
    class Meta:

        model = CustomUser
        fields = ['profile_photo', 'username', 'first_name', 'last_name', 'email', 'password1', 'password2']

class UserLoginForm(forms.ModelForm):

    class Meta:

        model = CustomUser
        fields = ['email', 'password']
        exclude = ['id', 'username', 'profile_photo', 'profile_photo_circle', 'first_name',
                   'last_name', 'slug', 'is_admin', 'is_active',
                   'is_staff', 'is_superuser']

class UserUpdateProfileForm(forms.ModelForm):

    class Meta:

        model = CustomUser
        fields = ['username',
                  'first_name', 'last_name']
        exclude = ['id', 'email', 'password' 'slug', 
                   'is_admin', 'is_active',  'profile_photo',
                   'is_staff', 'is_superuser', 'profile_photo_circle']
        
class UserChangePasswordForm(forms.Form):

    old_password = forms.CharField(widget=forms.PasswordInput())
    password1 = forms.CharField(widget=forms.PasswordInput())
    password2 = forms.CharField(widget=forms.PasswordInput())

class ArticleForm(forms.ModelForm):

    class Meta:

        model = Article
        fields = ['title_article', 'text_article']

class ArticleImageForm(forms.ModelForm):

    class Meta:

        model = ArticleImage
        fields = ['article_image']

class ForumForm(forms.ModelForm):

    class Meta:

        model = Forum
        fields = ['title_forum', 'first_message']

class ForumMessageForm(forms.ModelForm):

    class Meta:

        model = ForumMessage
        fields = ['message']

class GalleryForm(forms.ModelForm):

    class Meta:

        model = Gallery
        exclude = ['author']

class GalleryImageForm(forms.ModelForm):

    class Meta:

        model = GalleryImage
        fields = ['image', 'image_text_description']

class ChatForm(forms.ModelForm):

    class Meta:

        model = Chat
        fields = ['message']

class LikeForm(forms.ModelForm):

    class Meta:

        model = Like
        exclude = ['likes']

class CommentForm(forms.ModelForm):

    class Meta:

        model = Comment
        exclude = ['comment_text', 'publish_time', 'author',
                'likes', 'parent_comm_id', 'allcomments']

class TestForm(forms.ModelForm):

    class Meta:

        model = TestClass
        fields = ['text']