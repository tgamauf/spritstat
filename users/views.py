import logging

from django.conf import settings
from django.core.mail import send_mail
from django.shortcuts import redirect
from dj_rest_auth.views import (
    LoginView,
    PasswordResetConfirmView,
    sensitive_post_parameters_m,
)
import json
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.generics import DestroyAPIView, GenericAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import CustomUser
from .serializers import ContactFormSerializer, PasswordValidationSerializer


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


class CustomPasswordResetConfirmView(PasswordResetConfirmView):
    RESET_PASSWORD_PATH_TEMPLATE = "/reset-password/{uid}/{token}"

    def get(self, request, *args, **kwargs):
        uid = kwargs["uid"]
        token = kwargs["token"]

        return redirect(self.RESET_PASSWORD_PATH_TEMPLATE.format(uid=uid, token=token))


class CustomLoginView(LoginView):
    def process_login(self):
        super().process_login()

        if not self.serializer.validated_data["remember"]:
            self.request.session.set_expiry(0)
        else:
            self.request.session.set_expiry(settings.SESSION_COOKIE_AGE)


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
