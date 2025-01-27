FROM debian:bullseye


COPY ./nginx.sh ./nginx.sh

RUN apt-get update && apt-get install -y \
	nginx \
	openssl \
	ca-certificates \
	&& rm -rf /var/lib/apt/lists/* \
	&& chmod +x ./nginx.sh

COPY ./conf/nginx.conf /etc/nginx/sites-available/default

CMD ["./nginx.sh" ]