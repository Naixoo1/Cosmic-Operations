FROM nginx:alpine

# Adjust the default Nginx configuration file to listen on port 8080 instead of 80
RUN sed -i 's/listen       80;/listen       8080;/g' /etc/nginx/conf.d/default.conf

# Copy all your frontend project files into Nginx's public web directory
COPY . /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]