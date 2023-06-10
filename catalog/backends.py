from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

UserModel = get_user_model()

class CustomModelBackend(ModelBackend):
    def authenticate(self, request, username_or_email=None, password=None, **kwargs):
        
        # Проверяем, если введенное значение является действительным адресом электронной почты
        if '@' in str(username_or_email):
            kwargs = {'email': username_or_email}
        else:
            kwargs = {'username': username_or_email}
        
        try:
            user = UserModel.objects.get(**kwargs)

        except UserModel.DoesNotExist:
            return None
        print('Пользователь: ', user)        
        if user.check_password(password):
            return user
        
        return None