# System requirements
- 8 gb disk space
- 2 gb ram
- not a big demand on the CPU
- debian bullseye or later recommended

# Install dependencies

1. Git
```bash
sudo apt-get update
sudo apt-get install -y git
```

2. Docker
```bash
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
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install pm2 -g
```

4. Nginx
```bash
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

# Install TipCards application

1. Clone git project
**Attention:** if you run everything directly as root, make sure to switch to another directory than `/root` (e.g. `/opt`), otherwise nginx cannot access your source files later on.
```bash
sudo mkdir /opt/tip-cards
sudo chown $(id -u):$(id -g) /opt/tip-cards
cd /opt/tip-cards
git clone https://github.com/Satoshi-Engineering/tip-cards.git .
```

2. Install the database
```bash
sudo mkdir /opt/postgres
sudo chown $(id -u):$(id -g) /opt/postgres
cp -r /opt/tip-cards/docs/examples/postgres/. /opt/postgres/.
cd /opt/postgres
# change POSTGRES_PASSWORD and POSTGRES_NON_ROOT_PROJECT_USER_PASSWORD
vi .postgres.env
sudo docker compose up -d
```

3. Create a wallet in the lnbits instance you want to use (probably https://lnbits.com)
  * go to https://lnbits.com
    * there you can either create an account and launch your own lnbits (https://my.lnbits.com)
    * or try out the lnbits demo server: https://demo.lnbits.com
  * enter a name for your wallet and click "add a new wallet"
  * make sure to save the link (e.g. in your bookmarks) as this is where your TipCards' sats will go
  * click on "Node URL, API keys and Api docs" to the right and note "Admin key" and "Invoice/read key" for LNBITS_ADMIN_KEY and LNBITS_INVOICE_READ_KEY later
  * go to "extensions" and enable "LNURLp" and "withdraw" extensions
  * HINT: create an invoice and put some sats into the wallet, as withdrawing funded TipCards can cost some sats for routing fees

4. Build and serve the backend
```bash
# switch to tipcards root
cd /opt/tip-cards
npm ci
npm run backend-build
cp -r backend/database dist/backend/.
cp -r node_modules dist/.
cp backend/deploy/package.json dist/.
cp backend/deploy/ecosystem.config.cjs dist/.
cp backend/.env dist/.
# set the following variables in .env.local:
# POSTGRES_HOST=localhost
# POSTGRES_PASSWORD=<the-password-you-defined-in-postgres-env-before>
# TIPCARDS_ORIGIN=<your domain, e.g. https://my.tip-cards.custom>
# TIPCARDS_API_ORIGIN=<your domain, e.g. https://my.tip-cards.custom>
# LNBITS_ORIGIN=https://demo.lnbits.com
# LNBITS_INVOICE_READ_KEY=<see-above>
# LNBITS_ADMIN_KEY=<see-above>
# LNURL_SERVICE_ORIGIN=<your domain, e.g. https://my.tip-cards.custom>
vi dist/.env.local
cd dist
node ./backend/drizzle.migrate.js
pm2 start ecosystem.config.cjs
pm2 startup
# Attention: after this call pm2 will request you to run a command. Do not forget to copy+paste it to the command line and run it!
```

5. Build the frontend
```bash
# switch to tipcards root
cd /opt/tip-cards
# set the following variables in .env.local:
# VITE_BACKEND_API_ORIGIN=<your domain, e.g. https://my.tip-cards.custom>
# VITE_TIPCARDS_AUTH_ORIGIN=<your domain, e.g. https://my.tip-cards.custom>
# VITE_TIPCARDS_ORIGIN=<your domain, e.g. https://my.tip-cards.custom>
# VITE_CANONICAL_URL_ORIGIN=<your domain, e.g. https://my.tip-cards.custom>
vi frontend/.env.local
npm run frontend-build
```

6. Configure nginx
```bash
sudo rm /etc/nginx/sites-enabled/default
sudo cp docs/examples/nginx/tip-cards /etc/nginx/sites-available/
sudo mkdir -p /var/www/tip-cards
sudo ln -s /opt/tip-cards/dist/frontend /var/www/tip-cards/www
sudo chown -R www-data:www-data /var/www/tip-cards
# make sure www-data can read your TipCards files
# e.g. if you installed the TipCards project directly as root then it probably cannot access /root/tip-cards
sudo ln -s /etc/nginx/sites-available/tip-cards /etc/nginx/sites-enabled/tip-cards
sudo /etc/init.d/nginx reload
```

7. Add ssl certificate
```bash
sudo certbot --nginx
```

# Update TipCards application

1. Update backend
```bash
cd /opt/tip-cards
git pull
npm ci
npm run backend-build
cd dist
node ./backend/drizzle.migrate.js
pm2 restart lightning-tip-cards-backend
```

2. Update frontend
```bash
cd /opt/tip-cards
npm run frontend-build
```
