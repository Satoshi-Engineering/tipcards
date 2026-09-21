ARG LNBITS_IMAGE=docker.io/lnbits/lnbits:v1.6.0
FROM ${LNBITS_IMAGE}

RUN grep -Fq "          wallet.adminkey," /app/lnbits/static/js/pages/wallet.js \
    && sed -i "s/          wallet\.adminkey,/          this.g.wallet.adminkey,/" /app/lnbits/static/js/pages/wallet.js \
    && grep -Fq "          this.g.wallet.adminkey," /app/lnbits/static/js/pages/wallet.js

RUN grep -Fq '"/api/v1/lnurlauth",wallet.adminkey,' /app/lnbits/static/bundle-components.min.js \
    && sed -i 's|"/api/v1/lnurlauth",wallet.adminkey,|"/api/v1/lnurlauth",this.g.wallet.adminkey,|' /app/lnbits/static/bundle-components.min.js \
    && grep -Fq '"/api/v1/lnurlauth",this.g.wallet.adminkey,' /app/lnbits/static/bundle-components.min.js

RUN grep -Fq '@lnurl_router.post("/api/v1/lnurlauth")' /app/lnbits/core/views/lnurl_api.py \
    && sed -i 's|@lnurl_router.post("/api/v1/lnurlauth")|@lnurl_router.post("/api/v1/lnurlauth", response_model=None)|' /app/lnbits/core/views/lnurl_api.py \
    && grep -Fq '@lnurl_router.post("/api/v1/lnurlauth", response_model=None)' /app/lnbits/core/views/lnurl_api.py
