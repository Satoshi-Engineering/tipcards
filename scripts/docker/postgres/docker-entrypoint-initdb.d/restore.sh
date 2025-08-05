#!/bin/bash
set -e

psql -X postgres -U postgres < /docker-entrypoint-initdb.d/sql/init.sql
