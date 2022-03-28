from django.contrib.auth.models import AnonymousUser
from django.contrib.auth.password_validation import get_default_password_validators
from dj_rest_auth.serializers import LoginSerializer
from rest_framework import serializers
from typing import List, Optional, Tuple, TypedDict

from .models import CustomUser
from .password_validation import ZxcvbnValidator


class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ("email", "has_beta_access")


class PasswordValidationSerializer(serializers.Serializer):
    user: Optional[CustomUser]
    email = serializers.EmailField(required=False, allow_blank=True, write_only=True)
    password = serializers.CharField(write_only=True)

    class ValidateAttrs(TypedDict):
        password: str
        email: Optional[str]

    class ValidateReturn(TypedDict):
        valid: bool
        score: int
        suggestions: List[str]

    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)

        self.user = getattr(self.context.get("request"), "user", None)

    def validate(self, attrs: ValidateAttrs) -> ValidateReturn:
        password = attrs["password"]

        # If the ZxcvbnValidator isn't use we just accept the password if no
        #  validation error is raised by any other validator
        valid = True
        score = 0
        suggestions = []
        for validator in get_default_password_validators():
            if isinstance(validator, ZxcvbnValidator):
                valid, score, suggestions = self.__validate_with_zxcvbn(
                    validator, password, attrs
                )
            else:
                validator.validate(password)

        return {"valid": valid, "score": score, "suggestions": suggestions}

    def __validate_with_zxcvbn(
        self, validator: ZxcvbnValidator, password: str, attrs: ValidateAttrs
    ) -> Tuple[bool, int, List[str]]:
        email = attrs.get("email")
        tokens = None

        # If we are logged in the serializer will have the email attribute. In
        #  this case use it for the check.
        if hasattr(self, "user") and not isinstance(self.user, AnonymousUser):
            tokens = []
            user = self.user
            if not email:
                email = user.email

            tokens += ZxcvbnValidator.split_name(user.first_name)
            tokens += ZxcvbnValidator.split_name(user.last_name)

        return validator.custom_validate(password, email, tokens)


class CustomLoginSerializer(LoginSerializer):
    remember = serializers.BooleanField(required=False, allow_null=True, default=False)


class ContactFormSerializer(serializers.Serializer):
    contact_form_id = serializers.CharField(max_length=20)
    name = serializers.CharField(max_length=50, allow_blank=True)
    subject = serializers.CharField(max_length=100)
    message = serializers.CharField(max_length=500)


class LocaleSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ("locale",)
