#!/bin/bash
set -e

psql -X pretix -U pretix < /docker-entrypoint-initdb.d/init.sql
