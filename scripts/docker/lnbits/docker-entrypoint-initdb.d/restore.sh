#!/bin/bash
set -e

psql -X lnbits -U lnbits < /docker-entrypoint-initdb.d/sql/init.sql
