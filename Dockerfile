FROM node:20

RUN ln -sf /usr/share/zoneinfo/Europe/Amsterdam /etc/localtime
RUN useradd -U -u 1003 -m bot
RUN mkdir /app && chown bot:bot /app

WORKDIR /app
USER bot

COPY package*.json ./

RUN npm ci

COPY . /app/

CMD [ "npm", "start" ]
