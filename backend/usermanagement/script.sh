#!/bin/bash

python -m pip install djangorestframework
python -m pip install django-cors-headers
python -m pip install djangorestframework-simplejwt
python -m pip install django-allauth
python -m pip install requests dj_rest_auth
python -m pip install python-dotenv

python manage.py makemigrations

python manage.py migrate


python manage.py runserver 0.0.0.0:8000