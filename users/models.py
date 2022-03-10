from django.contrib.auth.models import AbstractUser
from django.db import models
from django_q.models import Schedule


class CustomUser(AbstractUser):
    has_beta_access = models.BooleanField(default=False)
    last_activity = models.DateTimeField(auto_now=True)
    next_notification = models.OneToOneField(
        Schedule, null=True, on_delete=models.CASCADE
    )

    def __str__(self):
        return self.email
