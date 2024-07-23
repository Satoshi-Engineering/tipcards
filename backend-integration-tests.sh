#/bin/bash

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

echo '' > backend.log

npm run backend-debug -- --envIntegrationTest 2>&1 > backend.log &
BACKEND_PID=$!

echo "Running backend with pid $BACKEND_PID, waiting for startup to finish"
while [ "x`grep 'app running and listening on port' backend.log`" = 'x' ]; do sleep 1; echo -n '.'; done

echo ''
echo 'Startup finished, running backend integration tests'

# lnbits currently has a bug that allows double/multiple withdraws. therefore we added a max-queries into traefik
# to make sure the integration tests don't run into troubles there only runs one integration test after the other
# (using maxWorkers=1 as runInBand is not available in vitest)
npm run backend-test-integration -- --minWorkers=1 --maxWorkers=3 --testTimeout=50000
INTEGRATION_TEST_EXIT_CODE=$?

if [ "$INTEGRATION_TEST_EXIT_CODE" -ne 0 ]; then
  kill_proc $BACKEND_PID
  echo 'Backend integration tests failed! Printing backend.log ------ START'
  cat backend.log
  echo 'Backend integration tests failed! Printing backend.log ------ END'
  exit $INTEGRATION_TEST_EXIT_CODE
fi

echo 'Backend integration tests finished, running frontend integration tests'
kill_proc $BACKEND_PID
