#!/bin/bash

kill_proc () {
  kill `descendent_pids $1`
}

descendent_pids() {
    pids=$(pgrep -P $1)
    echo $pids
    for pid in $pids; do
        descendent_pids $pid
    done
}

TIP_CARDS_DIR=$PWD

npm run backend-proxy 2>&1 >proxy.log &
PROXY_PID=$!

npm run backend-ngrok 2>&1 >ngrok.log &
NGROK_PID=$!

echo -n "Wait ngrok address: "
while [ "x`grep 'ngrok running on' ngrok.log`" = 'x' ]; do
  sleep 1; echo -n '.';
done

echo ""

NGROK_URL=`grep 'ngrok running on' ngrok.log |sed -e 's#ngrok running on ##'`

echo "Address is: $NGROK_URL"

if [[ "$OSTYPE" == 'darwin'* ]];
then
  sed -i '' -r -e 's#^(NGROK_OVERRIDE)=(.*)#\1='$NGROK_URL'#' $TIP_CARDS_DIR/backend/.env.local
  sed -i '' -r -e 's#^(VITE_NGROK_OVERRIDE)=(.*)#\1='$NGROK_URL'#' $TIP_CARDS_DIR/frontend/.env.local
else
  sed -i -r -e 's#^(NGROK_OVERRIDE)=(.*)#\1='$NGROK_URL'#' $TIP_CARDS_DIR/backend/.env.local
  sed -i -r -e 's#^(VITE_NGROK_OVERRIDE)=(.*)#\1='$NGROK_URL'#' $TIP_CARDS_DIR/frontend/.env.local
fi

npm run frontend-dev 2>&1 >frontend.log &
FRONTEND_PID=$!

npm run backend-dev 2>&1 >backend.log &
BACKEND_PID=$!

echo "Proxy ($PROXY_PID), ngrok ($NGROK_PID), frontend ($FRONTEND_PID), backend ($BACKEND_PID) - in background"
echo "---------------------"
echo -n "For stop please press enter..."
read stop

kill_proc $PROXY_PID
kill_proc $NGROK_PID
kill_proc $FRONTEND_PID
kill_proc $BACKEND_PID

if [[ "$OSTYPE" == 'darwin'* ]];
then
  sed -i '' -r -e 's#^(NGROK_OVERRIDE)=(.*)#\1=#' $TIP_CARDS_DIR/backend/.env.local
  sed -i '' -r -e 's#^(VITE_NGROK_OVERRIDE)=(.*)#\1=#' $TIP_CARDS_DIR/frontend/.env.local
else
  sed -i -r -e 's#^(NGROK_OVERRIDE)=(.*)#\1=#' $TIP_CARDS_DIR/backend/.env.local
  sed -i -r -e 's#^(VITE_NGROK_OVERRIDE)=(.*)#\1=#' $TIP_CARDS_DIR/frontend/.env.local
fi

echo "Stopped"
echo
