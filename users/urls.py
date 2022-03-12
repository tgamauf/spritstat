from django.urls import path, re_path
from django.views.generic import TemplateView
from dj_rest_auth import views as dj_rest_auth_views
from dj_rest_auth.registration import views as dj_rest_auth_registration_views

from . import views


# Most names are required by either allauth or dj_rest_auth. This is the reason
#  for the inconsistencies in naming
urlpatterns = [
    # URLs that do not require a session or valid token
    path(
        "auth/register/",
        dj_rest_auth_registration_views.RegisterView.as_view(),
        name="account_register",
    ),
    # This doesn't do anything as we redirect in the frontend, but is required
    #  by allauth, so we provide an empty template
    path(
        "auth/confirm-email-sent/",
        TemplateView.as_view(),
        name="account_email_verification_sent",
    ),
    re_path(
        r"^auth/confirm-email/(?P<key>[-:\w]+)/$",
        views.dummy_confirm_email_view,
        name="account_confirm_email",
    ),
    path(
        "auth/verify-email/",
        dj_rest_auth_registration_views.VerifyEmailView.as_view(),
        name="account_verify_email",
    ),
    path(
        "auth/resend-email/",
        dj_rest_auth_registration_views.ResendEmailVerificationView.as_view(),
        name="account_resend_email",
    ),
    path("auth/login/", views.CustomLoginView.as_view(), name="account_login"),
    path(
        "auth/password/validate/",
        views.PasswordValidationView.as_view(),
        name="account_password_validate",
    ),
    path(
        "auth/password/reset/",
        dj_rest_auth_views.PasswordResetView.as_view(),
        name="account_password_reset",
    ),
    path(
        "auth/password/reset/confirm/",
        views.CustomPasswordResetConfirmView.as_view(),
        name="account_password_reset_confirm",
    ),
    # This is really just used to redirect the GET request to the reset-URL to
    #  the frontend. The real password change is then handled by POST request to
    #  "account_password_reset_confirm" above.
    # The name here must match exactly as well as dj_rest_auth requires it.
    path(
        "auth/password/reset/confirm/<slug:uid>/<slug:token>/",
        views.CustomPasswordResetConfirmView.as_view(),
        name="password_reset_confirm",
    ),
    # URLs that require a user to be logged in with a valid session / token.
    path(
        "auth/logout/", dj_rest_auth_views.LogoutView.as_view(), name="account_logout"
    ),
    path(
        "auth/password/change/",
        dj_rest_auth_views.PasswordChangeView.as_view(),
        name="account_password_change",
    ),
    path(
        "account/",
        dj_rest_auth_views.UserDetailsView.as_view(),
        name="account_user_details",
    ),
    path("account/session/", views.session_view, name="account_session"),
    path("account/contact/", views.ContactView.as_view(), name="account_contact"),
    path("account/delete/", views.DeleteView.as_view(), name="account_delete"),
]
