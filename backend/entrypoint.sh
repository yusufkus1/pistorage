#!/bin/sh
set -e

CERT_DIR=/data/certs
mkdir -p "$CERT_DIR"

if [ ! -f "$CERT_DIR/server.crt" ]; then
  IP="${PI_IP:-127.0.0.1}"
  if [ "$IP" = "127.0.0.1" ]; then
    echo "UYARI: PI_IP ayarlanmamış, sertifika sadece localhost için geçerli olacak."
    echo "       .env dosyasına PI_IP=<pi-ip-adresi> ekleyin ve container'ı yeniden başlatın."
  fi
  HOSTNAME="${PI_HOSTNAME:-$(hostname -s)}"
  echo "Sertifika oluşturuluyor: IP=$IP, hostname=${HOSTNAME}.local ..."
  openssl req -x509 -newkey rsa:2048 \
    -keyout "$CERT_DIR/server.key" \
    -out "$CERT_DIR/server.crt" \
    -days 3650 -nodes \
    -subj "/CN=Pi Storage/O=Pi Storage" \
    -addext "subjectAltName=IP:${IP},IP:127.0.0.1,DNS:localhost,DNS:${HOSTNAME}.local,DNS:${HOSTNAME}"
  echo "Sertifika oluşturuldu."
fi

exec node /app/backend/server.js
