FROM node:18-alpine AS build
WORKDIR /app
ARG REACT_APP_ADMIN_USERNAME=admin
ARG REACT_APP_ADMIN_PASSWORD=ecommerceApp
ENV REACT_APP_ADMIN_USERNAME=$REACT_APP_ADMIN_USERNAME
ENV REACT_APP_ADMIN_PASSWORD=$REACT_APP_ADMIN_PASSWORD
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
