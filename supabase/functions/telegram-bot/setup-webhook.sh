#!/bin/bash
TOKEN="$TELEGRAM_BOT_TOKEN"
URL="https://rxrgenpyiydwurvrdyzz.supabase.co/functions/v1/telegram-bot"

curl -s -X POST "https://api.telegram.org/bot${TOKEN}/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"${URL}\"}" | jq .
