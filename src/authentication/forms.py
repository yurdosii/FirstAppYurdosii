from django import forms
from django.contrib.auth.models import User

from .utils import send_activation_email


class RegisterForm(forms.ModelForm):
    """Form to register new user

    Raises:
        forms.ValidationError: if user with provided username already exists
        forms.ValidationError: if user with provided email already exists
        forms.ValidationError: if two provided passwords don't match
    """

    password1 = forms.CharField()
    password2 = forms.CharField()


    class Meta:
        model = User
        fields = ("username", "email")

    def clean_username(self):
        """Check whether user with provided username already exists

        Raises:
            forms.ValidationError: if user with this username already exists

        Returns:
            string -- username
        """
        username = self.cleaned_data.get("username")
        qs = User.objects.filter(username__iexact=username)
        if qs.exists():
            raise forms.ValidationError("Cannot use this username. It's already registered")
        return username

    def clean_email(self):
        """Check whether user with provided email already exists

        Raises:
            forms.ValidationError: if user with this email already exists

        Returns:
            string -- email
        """
        email = self.cleaned_data.get("email")
        qs = User.objects.filter(email__iexact=email)
        if qs.exists():
            raise forms.ValidationError("Cannot use this email. It's already registered")
        return email

    def clean_password2(self):
        """Check that the two password entries match

        Raises:
            forms.ValidationError: if two passwords don't match

        Returns:
            string -- password
        """
        password1 = self.cleaned_data.get("password1")
        password2 = self.cleaned_data.get("password2")
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError("Passwords don't match")
        return password2

    def save(self, commit=True):
        """Save created user

        Keyword Arguments:
            commit {bool} -- whether saving should be committed (default: {True})

        Returns:
            User -- created user
        """
        user = super(RegisterForm, self).save(commit=False)
        user.set_password(self.cleaned_data["password1"])
        user.is_active = False
        user.save()

        send_activation_email(user)
        return user
