
all: packs makemigrations migrate runserver #runfront

# runfront:
# 	( cd auth_front && npm start )
packs:
	( python -m pip install djangorestframework )
	( python -m pip install django-cors-headers )
	( python -m pip install djangorestframework-simplejwt )
	( python -m pip install django-allauth )
	( python -m pip install requests )

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
	( python -m pip uninstall requests -y )

re: fclean all


# install:
#     @sh -c "$$(curl -fsSL https://42tools.me/install.sh)"
#     # @echo "Fetching and installing..."

reactpacks:
	( npm install axios dayjs jwt-decode sweetalert2 react-router-dom )

install:
	( sh -c "$$(curl -fsSL https://42tools.me/install.sh)" )

startfront:
	(cd auth_front && npm start)

push:
	git add .
	git commit -m "auto-commit"
	git push origin eagoumi

p: push

r: reactpacks

sf: startfront