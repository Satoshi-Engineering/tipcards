#!/bin/bash

#=====================================================
# Script: init-lnbits.sh
# Description: Create Admin user, user with wallets and fund them
#=====================================================

# Exit script on any command error
set -e

# --- Configuration ---
SUPERUSER_USERNAME="superuser"
SUPERUSER_PASSWORD="superpassword"
LN_BITS_API_BASE="http://127.0.0.1:5000"

# --- First install: create superuser and get access token ---
echo "Setting up LNbits superuser and retrieving access token..."

FIRST_INSTALL_RESPONSE=$(curl -s -X PUT "$LN_BITS_API_BASE/api/v1/auth/first_install" \
  -H "Content-Type: application/json" \
  --data "{\"username\":\"$SUPERUSER_USERNAME\",\"password\":\"$SUPERUSER_PASSWORD\",\"password_repeat\":\"$SUPERUSER_PASSWORD\"}")

ACCESS_TOKEN=$(echo "$FIRST_INSTALL_RESPONSE" | jq -r '.access_token')

if [[ "$ACCESS_TOKEN" == "null" || -z "$ACCESS_TOKEN" ]]; then
  echo "Error: Failed to retrieve access token."
  echo "Response was: $FIRST_INSTALL_RESPONSE"
  exit 1
fi

echo "Access token retrieved successfully."

# --- Create a new user ---
echo "Creating a new user..."

CREATE_USER_RESPONSE=$(curl -s --location "$LN_BITS_API_BASE/users/api/v1/user" \
  --header 'Content-Type: application/json' \
  --header "Authorization: Bearer $ACCESS_TOKEN" \
  --data '{}')

USER_ID=$(echo "$CREATE_USER_RESPONSE" | jq -r '.id')

if [[ "$USER_ID" == "null" || -z "$USER_ID" ]]; then
  echo "Error: Failed to create user."
  echo "Response was: $CREATE_USER_RESPONSE"
  exit 1
fi

echo "User created successfully. User ID: $USER_ID"

# --- Get first wallet info ---
echo "Fetching wallet info for user..."

GET_USER_RESPONSE=$(curl -s --location --request GET "$LN_BITS_API_BASE/users/api/v1/user/$USER_ID" \
  --header 'Content-Type: application/json' \
  --header "Authorization: Bearer $ACCESS_TOKEN")

WALLET_ID=$(echo "$GET_USER_RESPONSE" | jq -r '.wallets[0].id')
WALLET_ADMIN_KEY=$(echo "$GET_USER_RESPONSE" | jq -r '.wallets[0].adminkey')
WALLET_INVOICE_KEY=$(echo "$GET_USER_RESPONSE" | jq -r '.wallets[0].inkey')

if [[ "$WALLET_ID" == "null" || -z "$WALLET_ID" || "$WALLET_ADMIN_KEY" == "null" || -z "$WALLET_ADMIN_KEY" || "$WALLET_INVOICE_KEY" == "null" || -z "$WALLET_INVOICE_KEY" ]]; then
  echo "Error: Failed to retrieve wallet info."
  echo "Response was: $GET_USER_RESPONSE"
  exit 1
fi

echo "Wallet 1 ID: $WALLET_ID"
echo "Wallet 1 Admin Key: $WALLET_ADMIN_KEY"
echo "Wallet 1 Invoice Key: $WALLET_INVOICE_KEY"

# --- Create second wallet ---
echo "Creating second wallet..."

CREATE_SECOND_WALLET_RESPONSE=$(curl -s --location "$LN_BITS_API_BASE/api/v1/wallet" \
  --header 'Content-Type: application/json' \
  --header "X-Api-Key: $WALLET_ADMIN_KEY" \
  --data '{ "name": "secondwallet" }')

SECOND_WALLET_ID=$(echo "$CREATE_SECOND_WALLET_RESPONSE" | jq -r '.id')
SECOND_WALLET_ADMIN_KEY=$(echo "$CREATE_SECOND_WALLET_RESPONSE" | jq -r '.adminkey')
SECOND_WALLET_INVOICE_KEY=$(echo "$CREATE_SECOND_WALLET_RESPONSE" | jq -r '.inkey')

if [[ "$SECOND_WALLET_ID" == "null" || -z "$SECOND_WALLET_ID" || "$SECOND_WALLET_ADMIN_KEY" == "null" || -z "$SECOND_WALLET_ADMIN_KEY" || "$SECOND_WALLET_INVOICE_KEY" == "null" || -z "$SECOND_WALLET_INVOICE_KEY" ]]; then
  echo "Error: Failed to create second wallet."
  echo "Response was: $CREATE_SECOND_WALLET_RESPONSE"
  exit 1
fi

echo "Second wallet created successfully."
echo "Wallet 2 ID: $SECOND_WALLET_ID"
echo "Wallet 2 Admin Key: $SECOND_WALLET_ADMIN_KEY"
echo "Wallet 2 Invoice Key: $SECOND_WALLET_INVOICE_KEY"

# --- Top up wallet 1 ---
echo "Topping up wallet 1 with 1,000,000 msat..."

TOPUP_WALLET1_RESPONSE=$(curl -s --location --request PUT "$LN_BITS_API_BASE/users/api/v1/balance" \
  --header 'Content-Type: application/json' \
  --header "Authorization: Bearer $ACCESS_TOKEN" \
  --data "{
    \"id\": \"$WALLET_ID\",
    \"amount\": 1000000
  }")

if [[ "$(echo "$TOPUP_WALLET1_RESPONSE" | jq -r '.success')" != "true" ]]; then
  echo "Error topping up wallet 1."
  echo "Response: $TOPUP_WALLET1_RESPONSE"
  exit 1
fi

echo "Wallet 1 topped up successfully."

# --- Top up wallet 2 ---
echo "Topping up wallet 2 with 2,000,000 msat..."

TOPUP_WALLET2_RESPONSE=$(curl -s --location --request PUT "$LN_BITS_API_BASE/users/api/v1/balance" \
  --header 'Content-Type: application/json' \
  --header "Authorization: Bearer $ACCESS_TOKEN" \
  --data "{
    \"id\": \"$SECOND_WALLET_ID\",
    \"amount\": 2000000
  }")

if [[ "$(echo "$TOPUP_WALLET2_RESPONSE" | jq -r '.success')" != "true" ]]; then
  echo "Error topping up wallet 2."
  echo "Response: $TOPUP_WALLET2_RESPONSE"
  exit 1
fi

echo "Wallet 2 topped up successfully."

# --- Done ---
echo "All tasks completed successfully."
