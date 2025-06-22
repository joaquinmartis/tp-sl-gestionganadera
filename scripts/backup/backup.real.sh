#!/bin/bash
set -e

BACKUP_PATH="/backups"
URI="$MONGO_URI"

# Tiempos en segundos
ONE_DAY=86400
ONE_WEEK=604800
ONE_MONTH=2592000

mkdir -p "$BACKUP_PATH/daily"
mkdir -p "$BACKUP_PATH/weekly"
mkdir -p "$BACKUP_PATH/monthly"

timestamp() {
  date +%Y-%m-%d_%H-%M-%S
}

create_backup() {
  local type=$1
  local dir="$BACKUP_PATH/$type/$(timestamp)"
  mongodump --uri="$URI" --out="$dir"
  echo "✅ Backup $type creado: $dir"
}

get_last_age_seconds() {
  local type=$1
  local latest=$(find "$BACKUP_PATH/$type" -mindepth 1 -maxdepth 1 -type d -printf "%T@ %p\n" | sort -nr | head -n 1 | cut -d' ' -f2-)
  if [ -z "$latest" ]; then
    echo 9999999
    return
  fi
  local created=$(stat -c %Y "$latest")
  local now=$(date +%s)
  echo $((now - created))
}

# Backup diario
daily_age=$(get_last_age_seconds "daily")
if [ "$daily_age" -ge $ONE_DAY ]; then
  create_backup "daily"
  ls -1dt "$BACKUP_PATH/daily/"* | tail -n +8 | xargs -r rm -rf
else
  echo "⏳ Último backup diario fue hace $daily_age s. No se crea nuevo."
fi

# Backup semanal
weekly_age=$(get_last_age_seconds "weekly")
if [ "$weekly_age" -ge $ONE_WEEK ]; then
  create_backup "weekly"
  ls -1dt "$BACKUP_PATH/weekly/"* | tail -n +5 | xargs -r rm -rf
else
  echo "⏳ Último backup semanal fue hace $weekly_age s. No se crea nuevo."
fi

# Backup mensual
monthly_age=$(get_last_age_seconds "monthly")
if [ "$monthly_age" -ge $ONE_MONTH ]; then
  create_backup "monthly"
  ls -1dt "$BACKUP_PATH/monthly/"* | tail -n +13 | xargs -r rm -rf
else
  echo "⏳ Último backup mensual fue hace $monthly_age s. No se crea nuevo."
fi
