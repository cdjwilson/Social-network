from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.urls import reverse
from .models import Post, Liked, Follow
from django.core.paginator import Paginator
import json
from itertools import chain

from .models import User
from datetime import datetime



def index(request):
    posts = Post.objects.all()
    page_count = Paginator(posts, 10).num_pages
    return render(request, "network/index.html", {"page_count": range(1, page_count+1)})

@login_required(login_url="/login")
def post(request):
    now = datetime.now()
    if request.method == "POST":
        content = request.POST['content']
        if content != "":
            post = Post.objects.create(user = request.user, content = content, date=now.strftime("%Y-%m-%d %H:%M:%S"))
            post.save()
    return redirect(index)

def get_posts(request, username, page_num):
    """Takes page_num and returns the posts in that page"""
    num_following = -1
    num_followed = -1
    #if its all posts
    if username == " ":
        posts = Post.objects.all().order_by("-date")
    #if its the following posts
    elif username == "  ":
        following = Follow.objects.filter(user = request.user)
        # returns a list where each element is a list of posts by a user
        following_posts = [Post.objects.filter(user=user.follows) for user in following]
        posts = list(chain(*following_posts))
        posts.sort(key=lambda x: x.date, reverse=True)
    #if its a users profile
    else:
        user = User.objects.get(username=username)
        num_following = Follow.objects.filter(user=user).count()
        num_followed = Follow.objects.filter(follows=user).count()
        posts = Post.objects.filter(user=user).order_by("-date")
    
    paginator = Paginator(posts, 10)

    page_obj = paginator.get_page(page_num)
    return JsonResponse({
        "posts": [post.serialize() for post in page_obj],
        "num_pages": paginator.num_pages,
        "num_following": num_following,
        "num_followed": num_followed
    }, safe=False)

@login_required(login_url="/login")
def like_post(request, post_id):
    post = Post.objects.get(id=post_id)
    difference = 0
    try:
        liked_post = Liked.objects.get(user=request.user, post=post)
        liked_post.delete()
        post.likes -= 1
        post.save()
        difference = -1
    except:
        like_post = Liked.objects.create(user=request.user, post=post)
        post.likes += 1
        post.save()
        like_post.save()
        difference = 1
    return JsonResponse([post.likes, difference], safe=False)

def get_liked_posts(request):
    if request.user.is_authenticated:
        liked_post = Liked.objects.filter(user=request.user).all()
        return JsonResponse([post.post.id for post in liked_post], safe=False)
    else:
        return JsonResponse([], safe=False)

def save_post(request, post_id):
    if request.user.is_authenticated and request.method == "POST":
        post = Post.objects.get(id=post_id)
        data = json.loads(request.body)
        if data.get("content") == "":
            post.delete()
            return JsonResponse([], safe=False)
        else:
            post.content = data.get("content")
            post.save()
            return JsonResponse(post.content, safe=False)

def user_posts(request, username):
    user = User.objects.get(username=username)
    try:
        user_posts = Post.objects.filter(user=user).order_by("-date")
        return JsonResponse([post.serialize() for post in user_posts], safe=False)
    except:
        return JsonResponse([], safe=False)

@login_required(login_url="/login")
def get_following(request):
    try:
        following = Follow.objects.filter(user=request.user)
        return JsonResponse([user.follows.username for user in following], safe=False)
    except:
        return JsonResponse("error", safe=False)

@login_required(login_url="/login")
def follow(request, username):
    user = User.objects.get(username=username)
    try:
        follow = Follow.objects.get(user = request.user, follows = user)
        follow.delete()
        return JsonResponse("Follow", safe=False)
    except:
        follow = Follow.objects.create(user = request.user, follows=user)
        follow.save()
    return JsonResponse("Unfollow", safe=False)

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })
        elif username == " " or username == "  ":
            return render(request, "network/register.html", {
                "message": "Please enter a Username."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
