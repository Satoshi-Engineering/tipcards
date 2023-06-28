# Install dependencies

1. Git
```bash
sudo apt-get update
sudo apt-get install -y git
```

2. Docker
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

3. Nodejs + Pm2
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - &&\
sudo apt-get install -y nodejs
sudo npm install pm2 -g
```

4. Nginx
```bash
sudo apt-get update
sudo apt-get install -y nginx
```

5. certbot
```bash
sudo apt-get update
sudo apt-get install -y snapd
sudo snap install core
sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

# Install Tip Cards application

1. Clone git project
```bash
git clone https://github.com/Satoshi-Engineering/tip-cards.git
```

2. Install the database
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

3. Create a wallet in the lnbits instance you want to use (probably https://legend.lnbits.com)
  * go to https://legend.lnbits.com
  * enter a name for your wallet and click "add a new wallet"
  * make sure to save the link (e.g. in your bookmarks) as this is where your Tip Cards' sats will go
  * click on "Api docs" to the right and note "Admin key" and "Invoice/read key"
  * go to "extensions" and enable "LNURLp" and "withdraw" extensions
  * HINT: create an invoice and put some sats into the wallet, as withdrawing funded Tip Cards can cost some sats for routing fees

4. Build and serve the backend
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

5. Build the frontend
```bash
cd frontend
npm ci
npm run build
cd ..
```

6. Configure nginx
```bash
sudo rm /etc/nginx/sites-enabled/default
sudo cp docs/examples/nginx/tip-cards /etc/nginx/sites-available/
sudo mkdir -p /var/www/tip-cards
sudo ln -s `pwd`/frontend/dist /var/www/tip-cards/www
sudo ln -s /etc/nginx/sites-available/tip-cards /etc/nginx/sites-enabled/tip-cards
sudo /etc/init.d/nginx reload
```

7. Add ssl certificate
```bash
sudo certbot --nginx
```
