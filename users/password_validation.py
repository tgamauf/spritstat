from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
import re
from typing import List, Optional, Tuple
from zxcvbn import zxcvbn


class ZxcvbnValidator:
    """
    Validate password using the zxcvbn library.
    """

    def __init__(self, minimum_score: int = 2, tokens: List[str] = None) -> None:
        self.__minimum_score = minimum_score
        if tokens:
            self.__tokens = tokens
        else:
            self.__tokens = []

    @property
    def minimum_score(self) -> int:
        return self.__minimum_score

    @property
    def tokens(self) -> List[str]:
        return self.__tokens

    @staticmethod
    def __tokenize_email(email: str) -> List[str]:
        # Quick and dirty tokenizing of email
        name, domain = email.split("@")

        # We just split on the most common delimiters as this doesn't need to
        #  be perfect
        name_parts = re.split("[.+-_]", name)

        # Drop the TLD as this is irrelevant for a password
        domain_parts = domain.split(".")[:-1]

        return domain_parts + name_parts

    def custom_validate(
        self, password: str, email: Optional[str] = None, tokens: List[str] = None
    ) -> Tuple[bool, int, List[str]]:
        # Execute validation of a password without raising an exception as is
        #  the case with the validate method.

        # Tokens will be heavily penalized if used
        if tokens:
            custom_tokens = tokens.copy()
        else:
            custom_tokens = []

        if email:
            custom_tokens += self.__tokenize_email(email)

        result = zxcvbn(password, set(self.__tokens + custom_tokens))
        score = result["score"]
        suggestions = result["feedback"]["suggestions"]

        valid = False
        if score >= self.__minimum_score:
            valid = True

        return valid, score, suggestions

    @staticmethod
    def split_name(name: str) -> List[str]:
        # Utility function that allows splitting names into tokens by the usual
        #  delimiters.

        return re.split(r"[\s+-]", name)

    def validate(self, password: str, user: AbstractUser = None) -> None:
        name_tokens = []
        email = None
        if user and user.first_name:
            name_tokens += self.split_name(user.first_name)
        if user and user.last_name:
            name_tokens += self.split_name(user.last_name)
        if user and user.email:
            email = user.email
        valid, score, suggestions = self.custom_validate(password, email, name_tokens)
        if not valid:
            suggestion_text = " ".join([s for s in suggestions])
            raise ValidationError(
                f"Your password score is only {score}, but needs to be "
                f"{self.__minimum_score}. {suggestion_text}"
            )

    def get_help_text(self) -> str:
        return (
            f"Your password must reach a score of at least " f"{self.__minimum_score}."
        )
