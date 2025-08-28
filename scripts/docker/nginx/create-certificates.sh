#!/usr/bin/env bash

# exit if any command in the script exits with a code != 0
set -e

cd certs

# create new root certificate
echo "Also re-create root certificate? (yes/no)"
read -r rootCert
if [ "$rootCert" == 'yes' ]; then
  # Generate a private key for the root CA
  openssl genrsa -out rootCA.key 2048

  # Generate the root certificate
  openssl req -x509 -new -nodes -key rootCA.key -sha256 -days 1825 -out rootCA.pem \
    -subj "/C=AT/ST=Styria/L=Graz/O=DevCA/OU=LocalDev/CN=tipcards-dev-root"

  echo "New root certificate created, recreate the combined pem in lnbits directory!"
fi

generate_cert() {
  local domain="$1"

  # Generate the private key for the domain
  openssl genrsa -out "${domain}.key" 2048

  # Generate the CSR
  openssl req -new -key "${domain}.key" -out "${domain}.csr" \
    -subj "/C=AT/ST=Styria/L=Graz/O=SatoshiEngineering/OU=Dev/CN=${domain}"

  # Sign the certificate with the CA
  openssl x509 -req -in "${domain}.csr" \
    -CA rootCA.pem -CAkey rootCA.key -CAcreateserial \
    -out "${domain}.crt" -days 825 -sha256 -extfile v3.ext
}

generate_cert "tipcards.localhost"
generate_cert "auth.tipcards.localhost"
generate_cert "lnbits.tipcards.localhost"
generate_cert "volt-vault.tipcards.localhost"
