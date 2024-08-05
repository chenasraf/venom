#!/usr/bin/env zsh

if [[ "$1" == "--dry-run" || "$1" == "-d" ]]; then
  dry=1
fi

echo 'Installing dependencies...'
pnpm install
tmp=$(mktemp -d)
echo 'Generating systemd services...'
pnpm simple-scaffold -c scaffold.config.js -k services -o $tmp
echo 'Installing systemd services...'

if [[ $dry -eq 1 ]]; then
  echo 'Dry run. Exiting'
  echo
  tail -n +1 $tmp/*
  exit 0
fi

sudo mv $tmp/* /etc/systemd/system/
systemctl daemon-reload
systemctl enable venom-bot
systemctl enable venom-db
echo 'Installed.'
