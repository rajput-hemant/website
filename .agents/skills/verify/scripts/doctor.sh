#!/usr/bin/env bash
# Read-only: is this checkout and (optionally) the instance on <port> worth driving?
# Usage: doctor.sh [port]. Exit 0 healthy, 1 not worth driving. Changes nothing.
set -u

port="${1:-}"
root="$(git rev-parse --show-toplevel)"
fail=0
say() { printf '%s\n' "$*"; }
bad() { say "FAIL: $*"; fail=1; }

say "head: $(git -C "$root" rev-parse --short HEAD) on $(git -C "$root" rev-parse --abbrev-ref HEAD)"
if [ -n "$(git -C "$root" status --porcelain)" ]; then bad "working tree is dirty"; fi

for f in .env .env.local .env.development .env.development.local .env.production .env.production.local; do
  if [ -e "$root/$f" ]; then bad "$f exists; Next would load it and the drive could reach a real dataset"; fi
done

for v in NEXT_PUBLIC_SANITY_PROJECT_ID SANITY_API_READ_TOKEN SANITY_API_WRITE_TOKEN \
  SANITY_REVALIDATE_SECRET ASK_COOKIE_SECRET ASK_OWNER_PASSPHRASE NEXT_PUBLIC_FLAVOR; do
  if [ -n "${!v:-}" ]; then bad "$v is set in this shell (name only, value not printed)"; fi
done

if [ -n "$port" ]; then
  run_dir="${TMPDIR:-/tmp}/website-verify-$port"
  base="http://127.0.0.1:$port"
  pid="$(cat "$run_dir/server.pid" 2>/dev/null || true)"
  owner="$(lsof -ti "tcp:$port" -sTCP:LISTEN 2>/dev/null | head -n 1 || true)"
  if [ -z "$owner" ]; then
    bad "nothing is listening on $port"
  elif [ -z "$pid" ]; then
    bad "port $port is in use but $run_dir/server.pid is missing: not ours, do not drive"
  else
    # Ours when the listener is the recorded PID or one of its descendants.
    ours=0
    p="$owner"
    while [ -n "$p" ] && [ "$p" != 1 ] && [ "$p" != 0 ]; do
      if [ "$p" = "$pid" ]; then ours=1; break; fi
      p="$(ps -o ppid= -p "$p" 2>/dev/null | tr -d ' ')"
    done
    if [ "$ours" = 1 ]; then say "ok: port $port is owned by our server (pid $pid)"; else bad "port $port is owned by pid $owner, not our pid $pid"; fi
  fi
  code() { curl -s -o /dev/null -w '%{http_code}' --max-time 15 "$@"; }
  [ "$(code "$base/flavors")" = 200 ] || bad "GET /flavors is not 200"
  [ "$(code "$base/api/visits")" = 503 ] || bad "GET /api/visits is not 503: the visitor counter can reach a CMS, stop"
  home="$(curl -s --max-time 15 -H 'Cookie: hr_flavor=minimal' "$base/")"
  printf '%s' "$home" | grep -q '<h1' || bad "GET / with hr_flavor=minimal has no <h1>"
fi

if [ "$fail" = 0 ]; then say "doctor: worth driving"; else say "doctor: NOT worth driving"; fi
exit "$fail"
