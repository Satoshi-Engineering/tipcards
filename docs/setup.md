1. install git
```bash
sudo apt-get update
sudo apt-get install -y git
```

1. install docker-ce according to https://docs.docker.com/engine/install/debian/
```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

1. install nodejs
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - &&\
sudo apt-get install -y nodejs
```

1. install nginx
```bash
sudo apt-get update
sudo apt-get install -y nginx
```

1. install certbot
```bash
sudo apt-get update
sudo apt-get install -y snapd
sudo snap install core
sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

1. install pm2
```bash
sudo npm install pm2 -g
```

1. clone tipcards
```bash
git clone https://github.com/Satoshi-Engineering/tip-cards.git
```

1. install redis
```bash
cp -r tip-cards/docs/examples/redis/ .
cp redis/.env.example redis/.env
# change REDIS_PASSPHRASE and REDISCMD_PASSWORD
# attention: do not use special chars and not more than 24 chars as nodejs redis client cannot handle it
# it won't be reachable from outside anyways
vi redis/.env
cd redis
sudo docker compose up -d
cd ..
```

1. create a wallet in your lnbits instance you want to use (probably https://legend.lnbits.com)
* go to https://legend.lnbits.com
* enter a name for your wallet and click "add a new wallet"
* make sure to save the link (e.g. in your bookmarks) as this is where your tip cards sats will go
* click on "Api docs" to the right and note "Admin key" and "Invoice/read key"

1. build+run backend
```bash
cd tip-cards
npm ci
cd backend
cp .env.example .env
# change REDIS_PASSPHRASE to the passphrase you set earlier
# change TIPCARDS_ORIGIN and TIPCARDS_API_ORIGIN to the domain name (including protocol) that your tip-cards instance will run at
# e.g. https://my.tip-cards.custom
# add the "Admin key" from the previous step to LNBITS_ADMIN_KEY
# add the "Invoice/read key" from the previous step to LNBITS_INVOICE_READ_KEY
vi .env
npm ci
npm run build
pm2 start build/backend/index.js
cd ..
```

1. build frontend
```bash
cd frontend
npm ci
npm run build
cd ..
```

1. configure nginx
```bash
sudo rm /etc/nginx/sites-enabled/default
sudo cp docs/examples/nginx/tip-cards /etc/nginx/sites-available/
sudo mkdir -p /var/www/tip-cards
sudo ln -s `pwd`/frontend/dist /var/www/tip-cards/www
sudo ln -s /etc/nginx/sites-available/tip-cards /etc/nginx/sites-enabled/tip-cards
sudo /etc/init.d/nginx reload
```

1. configure certbot
```bash
sudo certbot --nginx
```
