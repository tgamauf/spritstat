from allauth.account.adapter import get_adapter
from allauth.account.signals import user_signed_up
from allauth.account.utils import url_str_to_user_pk
from dj_rest_auth.registration.views import VerifyEmailView
from django.conf import settings
from django.contrib.auth import user_logged_in, login
from django.core.mail import send_mail
from django.dispatch import receiver
from django.shortcuts import redirect
from dj_rest_auth.views import (
    LoginView,
    PasswordResetConfirmView,
    sensitive_post_parameters_m,
)
import json
import logging
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.generics import DestroyAPIView, GenericAPIView, RetrieveAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from .models import CustomUser
from .serializers import (
    ContactFormSerializer,
    PasswordValidationSerializer,
    LocaleSerializer,
)


class PasswordValidationView(GenericAPIView):
    serializer_class = PasswordValidationSerializer

    @sensitive_post_parameters_m
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        return Response(data=serializer.validated_data)


@api_view(["GET"])
def dummy_confirm_email_view(request, key):
    # This view really just redirects the call so the frontend can handle it.
    return redirect(f"/confirm-email/{key}")


class CustomVerifyEmailView(VerifyEmailView):
    # Adapt the email verification view, so we log in users automatically after
    #  email confirmation.

    def login_on_confirm(self, confirmation):
        user_pk = None
        user_pk_str = get_adapter(self.request).unstash_user(self.request)
        if user_pk_str:
            user_pk = url_str_to_user_pk(user_pk_str)
        user = confirmation.email_address.user
        if user_pk == user.pk and self.request.user.is_anonymous:
            login(self.request, user)

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.kwargs["key"] = serializer.validated_data["key"]
        confirmation = self.get_object()
        confirmation.confirm(self.request)
        self.login_on_confirm(confirmation)
        return Response(status=status.HTTP_204_NO_CONTENT)


class CustomPasswordResetConfirmView(PasswordResetConfirmView):
    RESET_PASSWORD_PATH_TEMPLATE = "/reset-password/{uid}/{token}"

    def get(self, request, *args, **kwargs):
        uid = kwargs["uid"]
        token = kwargs["token"]

        return redirect(self.RESET_PASSWORD_PATH_TEMPLATE.format(uid=uid, token=token))


class CustomLoginView(LoginView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        if self.serializer.validated_data["remember"]:
            self.request.session.set_expiry(settings.SESSION_COOKIE_AGE)
        else:
            self.request.session.set_expiry(0)

        return response


@api_view(["POST"])
def session_view(request):
    # This has to be a POST request as we need the CSRF token to prevent
    #  malicious actors to check if we are authenticated and GET requests
    #  need to be idempotent
    if not request.user.is_authenticated:
        return Response({"isAuthenticated": False})

    user = CustomUser.objects.get(id=request.user.id)
    user.save(update_fields=["last_activity"])
    return Response(
        {
            "isAuthenticated": True,
            "hasBetaAccess": user.has_beta_access,
            "email": user.email,
        }
    )


class ContactView(GenericAPIView):
    serializer_class = ContactFormSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Get staff email addresses so we can send to them
        staff = CustomUser.objects.filter(is_staff=True)

        if staff.count() == 0:
            logging.error("Cannot send contact request, no staff configured")
            return Response(status=status.HTTP_503_SERVICE_UNAVAILABLE)

        recipients = [user.email for user in staff]
        contact_form_id = serializer.validated_data["contact_form_id"]
        name = serializer.validated_data["name"]
        subject = serializer.validated_data["subject"]
        raw_message = serializer.validated_data["message"]

        message = {
            "name": name,
            "email": request.user.email,
            "subject": subject,
            "message": raw_message,
        }
        if not send_mail(
            subject=f"Contact form [{contact_form_id}]",
            message=json.dumps(message, ensure_ascii=False, indent=4),
            from_email=settings.SERVER_EMAIL,
            recipient_list=recipients,
            fail_silently=False,
        ):
            return Response(status=status.HTTP_503_SERVICE_UNAVAILABLE)

        return Response(status=status.HTTP_204_NO_CONTENT)


class DeleteView(DestroyAPIView, GenericAPIView):
    serializer_class = ContactFormSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class LocaleView(RetrieveAPIView, GenericAPIView):
    serializer_class = LocaleSerializer

    def get_object(self):
        return self.request.user

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        response = Response(status=status.HTTP_204_NO_CONTENT)
        locale = serializer.validated_data["locale"]

        # If the user is authenticated, store the locale for the user and keep
        #  also keep cookie until the session expires if the user stored the
        #  session. Otherwise, delete the cookie on browser close.
        max_age = None
        if request.user.is_authenticated:
            request.user.locale = locale
            request.user.save()

            if not request.session.get_expire_at_browser_close():
                max_age = request.session.get_expiry_age()

        response.set_cookie(settings.LANGUAGE_COOKIE_NAME, locale, max_age=max_age)

        return response


@receiver(user_signed_up)
@receiver(user_logged_in)
def set_locale(request: Request, user: CustomUser, **kwargs) -> None:
    # Save the locale provided via session for the user.
    locale = request.COOKIES.get(settings.LANGUAGE_COOKIE_NAME)
    if locale:
        user.locale = locale
        user.save()
