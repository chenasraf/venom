#!/usr/bin/env zsh

if [[ $# -eq 0 ]]; then
  echo 'Usage: pnpm service <start|stop|restart|enable|disable>'
  return 1
fi

systemctl $1 venom-bot
