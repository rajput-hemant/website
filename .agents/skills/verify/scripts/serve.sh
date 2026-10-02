#!/usr/bin/env bash
# Launch and teardown for one verification server.
# Usage: serve.sh start <port> | serve.sh stop <port>
set -u

cmd="${1:-}"
port="${2:-}"
case "$cmd" in start | stop) ;; *) echo "usage: serve.sh start|stop <port>" >&2; exit 2 ;; esac
case "$port" in '' | *[!0-9]*) echo "port must be a number" >&2; exit 2 ;; esac

root="$(git rev-parse --show-toplevel)"
run_dir="${TMPDIR:-/tmp}/website-verify-$port"
pid_file="$run_dir/server.pid"

if [ "$cmd" = start ]; then
  if [ "$port" = 3000 ] || [ "$port" = 3020 ]; then
    echo "port $port is reserved (3000 is the dev default, 3020 is the Playwright config's); pick another" >&2
    exit 2
  fi
  if lsof -ti "tcp:$port" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "port $port is already in use; not ours, refusing" >&2
    exit 1
  fi
  mkdir -p "$run_dir"
  cd "$root" || exit 1
  clean=(env -u NEXT_PUBLIC_SANITY_PROJECT_ID -u NEXT_PUBLIC_SANITY_DATASET -u SANITY_API_READ_TOKEN
    -u SANITY_API_WRITE_TOKEN -u SANITY_REVALIDATE_SECRET -u ASK_COOKIE_SECRET -u ASK_OWNER_PASSPHRASE
    -u ASK_PENDING_CAP -u ASK_TRUST_PROXY -u NEXT_PUBLIC_FLAVOR -u NEXT_PUBLIC_OWNER_BRANDING)
  if ! "${clean[@]}" bun run build >"$run_dir/build.log" 2>&1; then
    echo "build failed; see $run_dir/build.log" >&2
    exit 1
  fi
  "${clean[@]}" bun run start -p "$port" >"$run_dir/server.log" 2>&1 &
  echo $! >"$pid_file"
  for _ in $(seq 1 60); do
    if [ "$(curl -s -o /dev/null -w '%{http_code}' --max-time 3 "http://127.0.0.1:$port/flavors")" = 200 ]; then
      echo "ready: http://127.0.0.1:$port (pid $(cat "$pid_file"), logs in $run_dir)"
      exit 0
    fi
    sleep 1
  done
  echo "not ready after 60s; see $run_dir/server.log. Run 'serve.sh stop $port' before retrying." >&2
  exit 1
fi

# stop: kill only what we started, never by process name.
if [ ! -f "$pid_file" ]; then
  echo "no $pid_file: nothing of ours to stop, killing nothing"
  exit 0
fi
pid="$(cat "$pid_file")"
kill_tree() {
  local child
  for child in $(pgrep -P "$1" 2>/dev/null); do kill_tree "$child"; done
  kill "$1" 2>/dev/null || true
}
kill_tree "$pid"
rm -rf "$run_dir"
echo "stopped pid $pid and removed $run_dir (evidence and .next untouched)"
