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

npm run backend-dev -- --envFilePostfix=integrationTest 2>&1 > backend.log &
BACKEND_PID=$!

echo "Running backend with pid $BACKEND_PID, waiting for startup to finish"
while [ "x`grep 'app running and listening on port' backend.log`" = 'x' ]; do sleep 1; echo -n '.'; done

echo ''
echo 'Startup finished, running integration tests'

# lnbits currently has a bug that allows double/multiple withdraws. therefore we added a max-queries into traefik
# to make sure the integration tests don't run into troubles there only run one integration test after the other
# (using maxWorkers=1 as runInBand is not available in vitest)
export __ENV_FILE_POSTFIX__='integrationTest'
npm run backend-test-integration -- --minWorkers=1 --maxWorkers=1 --testTimeout=50000
INTEGRATION_TEST_EXIT_CODE=$?

kill_proc $BACKEND_PID
if [ "$INTEGRATION_TEST_EXIT_CODE" -ne 0 ]; then
  echo 'Integration Tests failed! Printing backend.log ------ START'
  cat backend.log
  echo 'Integration Tests failed! Printing backend.log ------ END'
fi
rm backend.log
exit $INTEGRATION_TEST_EXIT_CODE
