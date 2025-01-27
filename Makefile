
all: up

up:
	docker-compose up --build -d

down:
	docker-compose down -t 0

clean:
	docker-compose down -t 0
	docker system prune -af

fclean: clean
	docker volume prune -f

re: fclean all


# install:
#     @sh -c "$$(curl -fsSL https://42tools.me/install.sh)"
#     # @echo "Fetching and installing..."

push:
	git add .
	git commit -m "auto-commit"
	git push

p: push
