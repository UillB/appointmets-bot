#!/bin/bash

# Encrypted Backup Script for Appointments Bot
# This script creates encrypted backups of the system

echo "🔐 Creating Encrypted Backup - $(date)"
echo "======================================"

# Create backup directory
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup database with encryption
echo "Backing up database..."
docker exec appointments-bot-db-1 pg_dump -U appointments appointments | gzip | openssl enc -aes-256-cbc -salt -out "$BACKUP_DIR/database.sql.gz.enc" -pass pass:backup_password

# Backup application data with encryption
echo "Backing up application data..."
tar -czf - ./backend/prisma ./backend/data | openssl enc -aes-256-cbc -salt -out "$BACKUP_DIR/app_data.tar.gz.enc" -pass pass:backup_password

# Backup configuration files
echo "Backing up configuration files..."
tar -czf - ./nginx.conf ./docker-compose.yml | openssl enc -aes-256-cbc -salt -out "$BACKUP_DIR/config.tar.gz.enc" -pass pass:backup_password

# Create backup manifest
echo "Creating backup manifest..."
cat > "$BACKUP_DIR/manifest.txt" << EOL
Backup Date: $(date)
Database: database.sql.gz.enc
Application Data: app_data.tar.gz.enc
Configuration: config.tar.gz.enc
Encryption: AES-256-CBC
EOL

echo "Encrypted backup created in: $BACKUP_DIR"
echo "Backup completed successfully"
