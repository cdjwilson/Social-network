from django.contrib import admin
from .models import Post, Liked, Follow, User

# Register your models here.
admin.site.register(Post)
admin.site.register(Liked)
admin.site.register(Follow)
admin.site.register(User)