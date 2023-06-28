1. install git
1. install docker-ce
1. install docker-compose
1. install nodejs
1. install nginx
1. install certbot
1. install pm2
`npm install pm2 -g`

1. clone tipcards
```bash
git clone git@github.com:Satoshi-Engineering/tip-cards.git
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
docker-compose up -d
cd ..
```

1. create a wallet in your lnbits instance you want to use (probably https://legend.lnbits.com)

1. build+run backend
```bash
cd tip-cards/backend
cp .env.example .env
# change REDIS_PASSPHRASE to the passphrase you set earlier
# change TIPCARDS_ORIGIN and TIPCARDS_API_ORIGIN to the domain name (including protocol) that your tip-cards instance will run at
# e.g. https://my.tip-cards.custom
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
cp mkdir -p /var/www/tip-cards
sudo ln -s dist /var/www/tip-cards/www
sudo ln -s /etc/nginx/sites-available/tip-cards /etc/nginx/sites-enabled/tip-cards
sudo /etc/init.d/nginx reload
```

1. configure certbot
