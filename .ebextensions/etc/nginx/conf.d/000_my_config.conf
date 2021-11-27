http {
  server {
    listen 3000;
    server_name jtschuwirth.xyz;

    location / {
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header Host $host;

      proxy_pass http://nodes;

      # enable WebSockets
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrade";
    }
  }

  upstream nodes {
    # enable sticky session based on IP
    ip_hash;

    server app01:3000;
    server app02:3000;
    server app03:3000;
  }
}