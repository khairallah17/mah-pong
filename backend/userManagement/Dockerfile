FROM python:3

WORKDIR /app
COPY requirements.txt .

RUN pip install -r requirements.txt

COPY . /app/

EXPOSE 8000

RUN chmod +x script.sh

CMD [ "/bin/bash", "script.sh" ]