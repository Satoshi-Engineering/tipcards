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
echo 'Backend startup finished, running e2e tests'

npm run e2e-tests-with-frontend-build
INTEGRATION_TEST_EXIT_CODE=$?

kill_proc $BACKEND_PID
if [ "$INTEGRATION_TEST_EXIT_CODE" -ne 0 ]; then
  echo 'Frontend integration tests failed! Printing backend.log ------ START'
  cat backend.log
  echo 'Frontend integration tests failed! Printing backend.log ------ END'
fi
exit $INTEGRATION_TEST_EXIT_CODE
