#!/usr/bin/env zsh

if [[ $# -lt 2 ]]; then
  echo 'Usage: pnpm service <start|stop|restart|enable|disable|logs>'
  return 1
fi

name=venom-$1
if [[ "$2" == "logs" ]]; then
  journalctl -n 30 -f -u $name.service
else
  systemctl $2 $name
fi
