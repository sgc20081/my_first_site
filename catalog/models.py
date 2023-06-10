from distutils.command.upload import upload
from email import message
from email.policy import default
from tkinter import CASCADE
from django.db import models
from django.utils import timezone
from django.urls import reverse #Used to generate URLs by reversing the URL patterns
from django.contrib.auth.models import PermissionsMixin, AbstractBaseUser, BaseUserManager
from django.conf import settings
from django.contrib.auth import get_user_model
from uuid import uuid4
import os
from os.path import splitext
from uuid import uuid4
from django.core.files.storage import FileSystemStorage
from django.contrib.postgres.fields import ArrayField


# Create your models here.

class CustomAccountManager(BaseUserManager):

    def create_user(self, email, username, password):
        user = self.model(email=email, username=username, password=password)
        user.set_password(password)
        user.is_staff = False
        user.is_superuser = False
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password):
        """
        Creates and saves a superuser with the given email and password.
        """
        user = self.model(email=email, username=username, password=password)
        user.set_password(password)
        user.is_staff = True
        user.is_superuser = True
        user.is_admin = True
        user.save(using=self._db)
        return user

    def get_by_natural_key(self, email_):
        print(email_)
        return self.get(email=email_)

def user_profile_photo_directory_path(instance, filename):
    _, ext = splitext(filename)
    # file will be uploaded to MEDIA_ROOT/user_<id>/<filename>
    return 'static/images/profiles/user_{0}/{1}'.format(instance.id, 'profile_photo' + ext)

def user_profile_photo_circle_directory_path(instance, filename):
    _, ext = splitext(filename)
    # file will be uploaded to MEDIA_ROOT/user_<id>/<filename>
    return 'static/images/profiles/user_{0}/{1}'.format(instance.id, 'profile_photo_circle' + ext)

class CustomUser(AbstractBaseUser, PermissionsMixin, models.Model):

    username = models.CharField(max_length=20, null=True)
    profile_photo = models.ImageField(default='static/images/design/login_icon.svg', upload_to=user_profile_photo_directory_path, null=True, blank=True)
    profile_photo_circle = models.ImageField(default='static/images/design/login_icon.svg', upload_to=user_profile_photo_circle_directory_path, null=True, blank=True)
    first_name = models.CharField(max_length=20, blank=True)
    last_name = models.CharField(max_length=20, blank=True)
    email = models.EmailField(unique=True, null=True)
    slug = models.SlugField(verbose_name='URL', max_length=50, unique=True, null=True)
    is_admin = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:

        ordering = ['username']

    objects = CustomAccountManager()

    def __str__(self):
        return self.email

    def get_short_name(self):
        return self.email

    def as_custom_user(self):
        return super(get_user_model(), self)
        
    def get_absolute_url(self):
        
        return reverse('user_profile', args=[str(self.username)])

class Like(models.Model):

    likes = models.TextField(null=True, blank=True)

class AllCommentsOfObject(models.Model):

    comments = models.TextField(null=True, blank=True)

class Comment(models.Model):

    comment_text = models.TextField()
    publish_time = models.DateTimeField(default = timezone.now)
    author = models.ForeignKey(CustomUser, on_delete=models.CASCADE, null=True)
    likes = models.ForeignKey(Like, on_delete=models.CASCADE, null=True)
    parent_comm_id = models.IntegerField(null=True, default=0)
    allcomments = models.ForeignKey(AllCommentsOfObject, on_delete=models.CASCADE, null=True)

class Forum(models.Model):

    title_forum = models.CharField(max_length=100, null=True)
    publish_time = models.DateTimeField(default = timezone.now)
    author = models.ForeignKey(CustomUser, on_delete=models.CASCADE, null=True)
    first_message = models.TextField(max_length=1000, null=True)  

    def __str__(self):
        """
        String for representing the Model object.
        """
        return self.title_forum

    def get_absolute_url(self):
        """
        Returns the url to access a particular book instance.
        """
        return reverse('forum_theme', args=[str(self.id)])

class ForumMessage(models.Model):

    message = models.TextField(max_length=1000, null=True)
    author = models.ForeignKey(CustomUser, on_delete=models.CASCADE, null=True)
    forum_theme = models.ForeignKey('Forum', on_delete=models.CASCADE, null=True)
    publish_time = models.DateTimeField(default = timezone.now)

    def __str__(self):
        """
        String for representing the Model object.
        """
        return self.message

class Article(models.Model):

    title_article = models.CharField(max_length=100, null=True)
    publish_time = models.DateField(default = timezone.now)
    author = models.ForeignKey(CustomUser, on_delete=models.CASCADE,  related_name='article_author',  null=True)
    text_article = models.TextField(null=True)
    likes = models.ForeignKey(Like, on_delete=models.CASCADE, null=True)
    allcomments = models.ForeignKey(AllCommentsOfObject, on_delete=models.CASCADE, null=True)

    def __str__(self):
        """
        String for representing the Model object.
        """
        return self.title_article

    def get_absolute_url(self):
        
        return reverse('article_text', args=[str(self.id)])

class ArticleUUIDFileStorage(FileSystemStorage):
    def get_available_name(self, name, max_length=None):
        _, ext = splitext(name)
        return 'static/images/articles/' + uuid4().hex + ext

class ArticleImage(models.Model):

    article_image = models.ImageField(storage=ArticleUUIDFileStorage())
    
    def __str__(self):
        """
        String for representing the Model object.
        """
        return str(self.article_image)
"""
    def get_absolute_url(self):
        return reverse('', args=[str(self.id)])
"""

class Gallery(models.Model):

    author = models.ForeignKey(CustomUser, on_delete=models.CASCADE)

class GalleryUUIDFileStorage(FileSystemStorage):

    def get_available_name(self, name, max_length=None):
        _, ext = splitext(name)
        return 'static/images/gallery/'+uuid4().hex + ext

def user_gallery_directory_path(instance, filename):
    _, ext = splitext(filename)
    # file will be uploaded to MEDIA_ROOT/user_<id>/<filename>
    return 'static/images/gallery/user_{0}/{1}'.format(instance.author.id, uuid4().hex + ext)

class GalleryImage(models.Model):
    
    author = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    image = models.ImageField(upload_to=user_gallery_directory_path)
    gallery = models.ForeignKey(Gallery, on_delete=models.CASCADE, null=True)
    likes = models.ForeignKey(Like, on_delete=models.CASCADE, null=True)
    allcomments = models.ForeignKey(AllCommentsOfObject, on_delete=models.CASCADE, null=True)
    image_text_description = models.TextField(null=True, blank=True)

class ChatRoom(models.Model):

    chat_room = models.CharField(max_length=200)
    users = models.ManyToManyField(CustomUser, through='UserChat')

class Chat(models.Model):

    message = models.CharField(max_length=200, null=True)
    author = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='author')
    publish_time = models.CharField(max_length=200, null=True)
    chat_room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE,  related_name='chat_room_messages',  null=True)

class UserChat (models.Model):

    chat_room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    last_read_msg = models.ForeignKey(Chat, on_delete=models.CASCADE, null=True)

class TestClass(models.Model):

    text = models.TextField()
    likes = models.ForeignKey(Like, on_delete=models.CASCADE, null=True)