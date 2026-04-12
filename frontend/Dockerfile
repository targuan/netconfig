FROM node:24-alpine


COPY . /frontend

WORKDIR /frontend

RUN npm install -g @angular/cli && npm install && ng build


FROM busybox 
COPY --from=0 /frontend/dist /app
