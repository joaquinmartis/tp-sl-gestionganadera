#!/bin/bash
set -e

DATE=$(date +%Y-%m-%d)
BACKUP_PATH="/backups"

# 🗓 Día de la semana (1 = lunes, 7 = domingo)
DAY_OF_WEEK=$(date +%u)

# 🗓 Día del mes (01 = primero de mes)
DAY_OF_MONTH=$(date +%d)

# 1. BACKUP DIARIO → siempre
DAILY_DIR="$BACKUP_PATH/daily/$DATE"
mongodump --uri="$MONGO_URI" --out="$DAILY_DIR"
echo "✅ Backup diario creado en: $DAILY_DIR"

# Mantener solo los 7 más recientes
ls -1dt "$BACKUP_PATH/daily/"* | tail -n +8 | xargs -r rm -rf

# 2. BACKUP SEMANAL → si es domingo
if [ "$DAY_OF_WEEK" -eq 7 ]; then
  WEEKLY_DIR="$BACKUP_PATH/weekly/$DATE"
  mongodump --uri="$MONGO_URI" --out="$WEEKLY_DIR"
  echo "✅ Backup semanal creado en: $WEEKLY_DIR"
  ls -1dt "$BACKUP_PATH/weekly/"* | tail -n +5 | xargs -r rm -rf
fi

# 3. BACKUP MENSUAL → si es el primer día del mes
if [ "$DAY_OF_MONTH" = "01" ]; then
  MONTHLY_DIR="$BACKUP_PATH/monthly/$DATE"
  mongodump --uri="$MONGO_URI" --out="$MONTHLY_DIR"
  echo "✅ Backup mensual creado en: $MONTHLY_DIR"
  ls -1dt "$BACKUP_PATH/monthly/"* | tail -n +13 | xargs -r rm -rf
fi
