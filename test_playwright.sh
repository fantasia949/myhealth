pnpm run dev > dev_server.log 2>&1 &
SERVER_PID=$!
sleep 2
xvfb-run pnpm exec playwright test
kill $SERVER_PID
rm dev_server.log
