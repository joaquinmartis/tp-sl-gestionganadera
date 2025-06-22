#!/bin/bash
set -e

BACKUP_PATH="/backups"
URI="$MONGO_URI"

# Crear directorios si no existen
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

check_and_seed() {
  local type=$1
  local limit=$2
  local files=$(ls -1 "$BACKUP_PATH/$type" 2>/dev/null | wc -l)
  if [ "$files" -eq 0 ]; then
    echo "🌱 No hay backups $type, creando uno..."
    create_backup "$type"
  fi
}

get_newest_age_seconds() {
  local type=$1
  local newest=$(find "$BACKUP_PATH/$type" -mindepth 1 -maxdepth 1 -type d -printf "%T@ %p\n" | sort -nr | head -n 1 | cut -d' ' -f2-)
  if [ -z "$newest" ]; then
    echo 99999
    return
  fi
  local created=$(stat -c %Y "$newest")
  local now=$(date +%s)
  echo $((now - created))
}


# 1. Backup diario (siempre)
create_backup "daily"
ls -1dt "$BACKUP_PATH/daily/"* | tail -n +8 | xargs -r rm -rf

# 2. Inicializar si están vacíos
check_and_seed "weekly" 4
check_and_seed "monthly" 12

# 3. Backup semanal si el más viejo tiene +30s
weekly_age=$(get_newest_age_seconds "weekly")
if [ "$weekly_age" -ge 30 ]; then
  create_backup "weekly"
  ls -1dt "$BACKUP_PATH/weekly/"* | tail -n +5 | xargs -r rm -rf
fi

# 4. Backup mensual si el más viejo tiene +60s
monthly_age=$(get_newest_age_seconds "monthly")
if [ "$monthly_age" -ge 60 ]; then
  create_backup "monthly"
  ls -1dt "$BACKUP_PATH/monthly/"* | tail -n +13 | xargs -r rm -rf
fi
