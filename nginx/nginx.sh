#!/bin/bash

openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/ssl/private/nginx.key -out /etc/ssl/certs/nginx.crt -subj "/C=MO/L=KH/O=1337/OU=student/CN=localhost"

nginx -g 'daemon off;'
