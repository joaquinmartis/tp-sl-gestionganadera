#!/bin/bash
set -e

NOW=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_PATH="/backups"

# 1. BACKUP DIARIO (cada 10s)
DAILY_DIR="$BACKUP_PATH/daily/$NOW"
mongodump --uri="$MONGO_URI" --out="$DAILY_DIR"
echo "✅ Backup diario: $NOW"
mkdir -p "$BACKUP_PATH/daily" "$BACKUP_PATH/weekly" "$BACKUP_PATH/monthly"
# Mantener solo 7 diarios
ls -1dt "$BACKUP_PATH/daily/"* | tail -n +8 | xargs -r rm -rf

# 2. BACKUP SEMANAL (cada 30s simulación)
if [ $(( $(date +%S) % 30 )) -eq 0 ]; then
  WEEKLY_DIR="$BACKUP_PATH/weekly/$NOW"
  mongodump --uri="$MONGO_URI" --out="$WEEKLY_DIR"
  echo "✅ Backup semanal: $NOW"
  ls -1dt "$BACKUP_PATH/weekly/"* | tail -n +5 | xargs -r rm -rf
fi

# 3. BACKUP MENSUAL (cada 60s simulación)
if [ "$(date +%S)" = "00" ]; then
  MONTHLY_DIR="$BACKUP_PATH/monthly/$NOW"
  mongodump --uri="$MONGO_URI" --out="$MONTHLY_DIR"
  echo "✅ Backup mensual: $NOW"
  ls -1dt "$BACKUP_PATH/monthly/"* | tail -n +13 | xargs -r rm -rf
fi
