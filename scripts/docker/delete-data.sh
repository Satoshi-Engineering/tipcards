#!/bin/sh

# exit if any command in the script exits with a code != 0
set -e

read -p "Should the ./data directory be erased? (y/N): " confirm
if [ "$confirm" != "y" ]; then
  echo "Operation canceled."
  exit 1
fi

# Check the system architecture
SYSTEM_ARCHITECTURE=$(uname -m)

if [ "$SYSTEM_ARCHITECTURE" = "arm64" ]; then
  rm -rf data
else
  SUDO=''
  if [ "$(id -u)" -ne 0 ]; then
    SUDO='sudo'
  fi
  # the x86 version of the pretix container is running with a different user id
  $SUDO rm -rf data
fi
