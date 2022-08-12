from email.policy import default
from tkinter import CASCADE
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.timezone import now


class User(AbstractUser):
    pass

class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, default=0, null=False)
    content = models.CharField(max_length=1000, null=False, default="")
    likes = models.IntegerField(null=False, default=0)
    date = models.DateTimeField()

    def serialize(self):
        return {
        "id": self.id,
        "user": self.user.username,
        "content": self.content,
        "likes": self.likes,
        "date": self.date
        }

class Liked(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, default=0, null=False)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, null=True)

class Follow(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, default=0, null=False)
    follows = models.ForeignKey(User, on_delete=models.CASCADE, default=0, null=False, related_name="follows")