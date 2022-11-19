FROM node:16

RUN ln -sf /usr/share/zoneinfo/Europe/Amsterdam /etc/localtime
RUN useradd -U -u 1003 -m place
RUN mkdir /app && chown place:place /app

WORKDIR /app
USER place

COPY package*.json ./

RUN npm ci

COPY . /app/

CMD [ "npm", "start" ]
