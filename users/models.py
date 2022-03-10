from __future__ import annotations
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.signals import pre_delete
from django.dispatch import receiver
from django_q.models import Schedule


class CustomUser(AbstractUser):
    has_beta_access = models.BooleanField(default=False)
    last_activity = models.DateTimeField(auto_now=True)
    next_notification = models.OneToOneField(
        Schedule, null=True, on_delete=models.SET_NULL
    )

    @staticmethod
    @receiver(pre_delete)
    def delete_next_notification(instance: CustomUser, **kwargs) -> None:
        if isinstance(instance, CustomUser):
            instance.next_notification.delete()

    def __str__(self):
        return self.email
