#!/usr/bin/env zsh

echo 'Installing dependencies...'
pnpm install
tmp=$(mktemp -d)
echo 'Generating systemd services...'
pnpm simple-scaffold -c scaffold.config.js -k services -o $tmp
echo 'Installing systemd services...'
sudo mv $tmp/* /etc/systemd/system/
systemctl daemon-reload
systemctl enable venom-bot
systemctl enable venom-db
echo 'Installed.'
