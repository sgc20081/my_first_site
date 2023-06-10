from django.contrib import admin

# Register your models here.

from .models import Forum, ForumMessage, Article, ArticleImage, CustomUser, Gallery, Chat

class ForumMessageInline(admin.TabularInline):
    model = ForumMessage
    extra = 0

class ForumAdmin(admin.ModelAdmin):

    list_display = ('title_forum', 'author', 'publish_time')
    inlines = [ForumMessageInline]

class ForumMessageAdmin(admin.ModelAdmin):

    list_display = ('message', 'author', 'forum_theme')

class ArticleAdmin(admin.ModelAdmin):
    model = Article
    list_display = ('title_article', 'author', 'publish_time', 'text_article')

class ArticleImageAdmin(admin.ModelAdmin):
    model = ArticleImage
    list_display = ('article_image','article_title_field')

class GalleryAdmin(admin.ModelAdmin):
    model = Gallery
    list_display = ('image')

class ChatAdmin(admin.ModelAdmin):
    model = Chat
    list_display = ('message', 'author', 'publish_time')

admin.site.register(Forum)
admin.site.register(ForumMessage)
admin.site.register(Article)
admin.site.register(CustomUser)
admin.site.register(Gallery)
admin.site.register(ArticleImage)
admin.site.register(Chat)