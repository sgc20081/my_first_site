# Generated by Django 4.1.5 on 2023-04-20 17:33

import catalog.models
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='CustomUser',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('username', models.CharField(max_length=20, null=True)),
                ('profile_photo', models.ImageField(blank=True, upload_to=catalog.models.user_profile_photo_directory_path)),
                ('profile_photo_circle', models.ImageField(blank=True, upload_to=catalog.models.user_profile_photo_circle_directory_path)),
                ('first_name', models.CharField(blank=True, max_length=20)),
                ('last_name', models.CharField(blank=True, max_length=20)),
                ('email', models.EmailField(max_length=254, null=True, unique=True)),
                ('slug', models.SlugField(null=True, unique=True, verbose_name='URL')),
                ('is_admin', models.BooleanField(default=False)),
                ('is_active', models.BooleanField(default=True)),
                ('is_staff', models.BooleanField(default=False)),
                ('is_superuser', models.BooleanField(default=False)),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.group', verbose_name='groups')),
                ('user_permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.permission', verbose_name='user permissions')),
            ],
            options={
                'ordering': ['username'],
            },
        ),
        migrations.CreateModel(
            name='AllCommentsOfObject',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('comments', models.TextField(blank=True, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='ArticleImage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('article_image', models.ImageField(storage=catalog.models.ArticleUUIDFileStorage(), upload_to='')),
            ],
        ),
        migrations.CreateModel(
            name='Chat',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('message', models.CharField(max_length=200, null=True)),
                ('publish_time', models.CharField(max_length=200, null=True)),
                ('author', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='author', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='ChatRoom',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('chat_room', models.CharField(max_length=200)),
            ],
        ),
        migrations.CreateModel(
            name='Forum',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title_forum', models.CharField(max_length=100, null=True)),
                ('publish_time', models.DateTimeField(default=django.utils.timezone.now)),
                ('first_message', models.TextField(max_length=1000, null=True)),
                ('author', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Gallery',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('author', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Like',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('likes', models.TextField(blank=True, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='UserChat',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('chat_room', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='catalog.chatroom')),
                ('last_read_msg', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='catalog.chat')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='TestClass',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('text', models.TextField()),
                ('likes', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='catalog.like')),
            ],
        ),
        migrations.CreateModel(
            name='GalleryImage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('image', models.ImageField(upload_to=catalog.models.user_gallery_directory_path)),
                ('image_text_description', models.TextField(blank=True, null=True)),
                ('allcomments', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='catalog.allcommentsofobject')),
                ('author', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('gallery', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='catalog.gallery')),
                ('likes', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='catalog.like')),
            ],
        ),
        migrations.CreateModel(
            name='ForumMessage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('message', models.TextField(max_length=1000, null=True)),
                ('publish_time', models.DateTimeField(default=django.utils.timezone.now)),
                ('author', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('forum_theme', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='catalog.forum')),
            ],
        ),
        migrations.CreateModel(
            name='Comment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('comment_text', models.TextField()),
                ('publish_time', models.DateTimeField(default=django.utils.timezone.now)),
                ('parent_comm_id', models.IntegerField(default=0, null=True)),
                ('allcomments', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='catalog.allcommentsofobject')),
                ('author', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('likes', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='catalog.like')),
            ],
        ),
        migrations.AddField(
            model_name='chatroom',
            name='users',
            field=models.ManyToManyField(through='catalog.UserChat', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='chat',
            name='chat_room',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='chat_room_messages', to='catalog.chatroom'),
        ),
        migrations.CreateModel(
            name='Article',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title_article', models.CharField(max_length=100, null=True)),
                ('publish_time', models.DateField(default=django.utils.timezone.now)),
                ('text_article', models.TextField(null=True)),
                ('allcomments', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='catalog.allcommentsofobject')),
                ('author', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='article_author', to=settings.AUTH_USER_MODEL)),
                ('likes', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='catalog.like')),
            ],
        ),
    ]
