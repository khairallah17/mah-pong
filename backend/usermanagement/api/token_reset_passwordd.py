from django.contrib.auth.tokens import PasswordResetTokenGenerator # type: ignore


class AccountActivationTokenGenerator(PasswordResetTokenGenerator):
    def hash_value_password(self, user):
        return (
            # str(user.pk) +
            # str(timestamp) +
            str(user.password)
            # str(user.is_active)
        )

account_activation_token = AccountActivationTokenGenerator()
        