
all: packs makemigrations migrate runserver #runfront

# runfront:
# 	( cd auth_front && npm start )
packs:
	(pip install djangorestframework)
	(python -m pip install django-cors-headers)
	(pip install djangorestframework-simplejwt)

makemigrations:
	( cd auth_backend && python manage.py makemigrations )

migrate:
	( cd auth_backend && python manage.py migrate )

runserver:
	( cd auth_backend && python manage.py runserver)

fclean:
	rm -rf auth_backend/*.sqlite3
	rm -rf auth_backend/api/__pycache__
	rm -rf auth_backend/auth_backend/__pycache__
	rm -rf auth_backend/api/migrations/__pycache__
	rm -rf auth_backend/api/migrations/0*_initial.py

re: fclean all


# install:
#     @sh -c "$$(curl -fsSL https://42tools.me/install.sh)"
#     # @echo "Fetching and installing..."

install:
	( sh -c "$$(curl -fsSL https://42tools.me/install.sh)" )

push:
	git add .
	git commit -m "auto-commit"
	git push origin eagoumi

p: push
