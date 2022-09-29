#! /bin/bash

if [ "$#" -ne 1 ]
then
  echo "Error: No domain name argument provided"
  echo "Usage: Provide a domain name as an argument"
  exit 1
fi

DOMAIN=$1

# Create root CA & Private key

openssl req -x509 \
            -sha256 -days 356 \
            -nodes \
            -newkey rsa:2048 \
            -subj "/CN=${DOMAIN}/C=NL/L=Amsterdam" \
            -keyout certs/rootCA.key -out certs/rootCA.crt 

# Generate Private key 

openssl genrsa -out certs/${DOMAIN}.key 2048

# Create csf conf

cat > certs/csr.conf <<EOF
[ req ]
default_bits = 2048
prompt = no
default_md = sha256
req_extensions = req_ext
distinguished_name = dn

[ dn ]
C = NL
ST = Noord Holland
L = Amsterdam
O = THX Network
OU = THX Network Dev
CN = ${DOMAIN}

[ req_ext ]
subjectAltName = @alt_names

[ alt_names ]
DNS.1 = ${DOMAIN}
DNS.2 = www.${DOMAIN}
IP.1 = 127.0.0.1

EOF

# create CSR request using private key

openssl req -new -key certs/${DOMAIN}.key -out certs/${DOMAIN}.csr -config certs/csr.conf

# Create a external config file for the certificate

cat > certs/cert.conf <<EOF

authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = ${DOMAIN}

EOF

# Create SSl with self signed CA

openssl x509 -req \
    -in certs/${DOMAIN}.csr \
    -CA certs/rootCA.crt -CAkey certs/rootCA.key \
    -CAcreateserial -out certs/${DOMAIN}.crt \
    -days 365 \
    -sha256 -extfile certs/cert.conf