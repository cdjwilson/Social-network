
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("post", views.post, name="post"),
    path("get_posts/<str:username>/<int:page_num>", views.get_posts, name="get_posts"),
    path("like_post/<int:post_id>", views.like_post, name="like_post"),
    path("get_liked_posts", views.get_liked_posts, name="get_liked_posts"),
    path("save_post/<int:post_id>", views.save_post, name="save_post"),
    path("posts/<str:username>", views.user_posts, name="user_posts"),
    path("get_following", views.get_following, name="get_following"),
    path("follow/<str:username>", views.follow, name="follow")
]
