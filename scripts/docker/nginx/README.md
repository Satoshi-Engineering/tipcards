# Nginx reverse proxy with root ca and certificate

```bash
cd certs

# Generate a private key for the root CA
openssl genrsa -out rootCA.key 2048

# Generate the root certificate
openssl req -x509 -new -nodes -key rootCA.key -sha256 -days 1825 -out rootCA.pem \
  -subj "/C=AT/ST=Styria/L=Graz/O=DevCA/OU=LocalDev/CN=lnbits-dev-root"

# Generate the private key for the domain
openssl genrsa -out lnbits.local.me.key 2048

# Generate the CSR
openssl req -new -key lnbits.local.me.key -out lnbits.local.me.csr \
  -subj "/C=AT/ST=Styria/L=Graz/O=SatoshiEngineering/OU=Dev/CN=lnbits.local.me"

openssl x509 -req -in lnbits.local.me.csr -CA rootCA.pem -CAkey rootCA.key -CAcreateserial \
-out lnbits.local.me.crt -days 825 -sha256 -extfile v3.ext  
````
