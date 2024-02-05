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

npm run backend-dev 2>&1 > backend.log &
BACKEND_PID=$!

echo "Running backend with pid $BACKEND_PID, waiting for startup to finish"
while [ "x`grep 'app running and listening on port' backend.log`" = 'x' ]; do sleep 1; echo -n '.'; done

echo '\n'
echo 'Startup finished, running integration tests'
npm run backend-test-integration -- --maxWorkers=2 --testTimeout=10000
INTEGRATION_TEST_EXIT_CODE=$?

kill_proc $BACKEND_PID
rm backend.log
exit $INTEGRATION_TEST_EXIT_CODE
