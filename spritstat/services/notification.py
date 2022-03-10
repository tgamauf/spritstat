from allauth.account.models import EmailAddress
from allauth.account.signals import user_signed_up
from allauth.account.utils import user_pk_to_url_str
from allauth.utils import build_absolute_uri
from datetime import datetime, timedelta
from django.conf import settings
from django.contrib.sites.models import Site
from django.core.mail import EmailMultiAlternatives, EmailMessage
from django.dispatch import receiver
from django.template import TemplateDoesNotExist
from django.template.loader import render_to_string
from django.urls import reverse
from django.utils.crypto import salted_hmac
from django.utils.encoding import force_str
from typing import Union, Dict

from django_q.models import Schedule
from django_q.tasks import schedule

from spritstat.models import Location
from spritstat.signals import location_created
from users.models import CustomUser

KEY_SALT = "spritstat.services.notification"
LOCATION_REMINDER_DELAY_WEEKS = 1
LOCATION_REMINDER_TEMPLATE_PREFIX = "spritstat/email/location_reminder"


@receiver(user_signed_up)
def schedule_location_notification(request, user: CustomUser, **kwargs) -> None:
    # Schedule a onetime notification for this user.
    user.next_notification = schedule(
        "spritstat.services.send_location_notification",
        user.id,
        schedule_type=Schedule.ONCE,
        next_run=datetime.now() + timedelta(weeks=LOCATION_REMINDER_DELAY_WEEKS),
    )
    user.save()


@receiver(location_created)
def location_created(location: Location, **kwargs) -> None:
    # Remove the "please add location" notification for this user as soon as a
    #  location is created.
    location.user.next_notification = None
    location.user.save()


def send_location_notification(user_id: int) -> None:
    # Send the "please add location" notification to the provided user.

    user = CustomUser.objects.get(id=user_id)

    # Skip the notification if the user isn't active anymore.
    if not user.is_active:
        return

    _send_mail(LOCATION_REMINDER_TEMPLATE_PREFIX, user)


def _send_mail(email_template_prefix: str, user: CustomUser) -> None:
    email = EmailAddress.objects.get_primary(user).email
    current_site = Site.objects.get_current()
    unsubscribe_url = _get_unsubscribe_url(user)
    context = {
        "current_site": current_site,
        "unsubscribe_url": unsubscribe_url,
        "has_unsubscribe": True,
    }
    msg = _render_mail(email_template_prefix, email, context)
    msg.send()


def _get_unsubscribe_url(user: CustomUser) -> str:
    uid = user_pk_to_url_str(user)
    token = Token(user).value
    location = reverse("unsubscribe", args=[uid, token])
    url = build_absolute_uri(None, location)

    return url


def _render_mail(
    template_prefix: str, email: str, context: Dict
) -> Union[EmailMultiAlternatives, EmailMessage]:
    to = [email] if isinstance(email, str) else email

    subject = render_to_string(f"{template_prefix}_subject.txt")
    # remove superfluous line breaks
    subject = " ".join(subject.splitlines()).strip()
    subject = _format_email_subject(subject)

    from_email = settings.DEFAULT_FROM_EMAIL

    bodies = {}
    for ext in ["html", "txt"]:
        try:
            template_name = f"{template_prefix}_message.{ext}"
            bodies[ext] = render_to_string(template_name, context).strip()
        except TemplateDoesNotExist:
            if ext == "txt" and not bodies:
                # We need at least one body
                raise
    if "txt" in bodies:
        msg = EmailMultiAlternatives(subject, bodies["txt"], from_email, to)
        if "html" in bodies:
            msg.attach_alternative(bodies["html"], "text/html")
    else:
        msg = EmailMessage(subject, bodies["html"], from_email, to)
        msg.content_subtype = "html"  # Main content is now text/html

    return msg


def _format_email_subject(subject: str) -> str:
    prefix = settings.ACCOUNT_EMAIL_SUBJECT_PREFIX
    if prefix is None:
        site = Site.objects.get_current()
        prefix = "[{name}] ".format(name=site.name)

    return prefix + force_str(subject)


class Token:
    # HMAC token in hex format that ensures that only the correct user can
    #  unsubscribe from notifications.

    _value: str

    def __init__(self, user) -> None:
        hash_value = f"{user.id}{user.email}"
        self._value = salted_hmac(KEY_SALT, hash_value).hexdigest()

    @property
    def value(self) -> str:
        return self._value

    def check(self, value) -> bool:
        return self._value == value
