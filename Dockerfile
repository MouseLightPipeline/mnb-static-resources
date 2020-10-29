FROM node:12.19

WORKDIR /app

COPY dist .

RUN yarn install --production=true

CMD ["./docker-entry.sh"]

EXPOSE 5000
