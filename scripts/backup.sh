#!/bin/bash

# Production Backup Script for Appointments Bot
# This script creates backups of the database and application data

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="appointments-backup-$TIMESTAMP"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"

# Function to create backup directory
create_backup_dir() {
    print_status "Creating backup directory..."
    mkdir -p "$BACKUP_PATH"
    print_success "Backup directory created: $BACKUP_PATH"
}

# Function to backup database
backup_database() {
    print_status "Backing up database..."
    
    local db_backup_file="$BACKUP_PATH/database.sql"
    
    if docker-compose exec -T db pg_dump -U appointments -d appointments > "$db_backup_file"; then
        print_success "Database backup completed: $db_backup_file"
        
        # Get backup size
        local backup_size=$(du -h "$db_backup_file" | cut -f1)
        print_status "Database backup size: $backup_size"
    else
        print_error "Database backup failed"
        return 1
    fi
}

# Function to backup application data
backup_app_data() {
    print_status "Backing up application data..."
    
    # Backup uploads directory
    if [ -d "uploads" ]; then
        print_status "Backing up uploads directory..."
        cp -r uploads "$BACKUP_PATH/uploads"
        print_success "Uploads directory backed up"
    else
        print_warning "Uploads directory not found"
    fi
    
    # Backup logs directory
    if [ -d "logs" ]; then
        print_status "Backing up logs directory..."
        cp -r logs "$BACKUP_PATH/logs"
        print_success "Logs directory backed up"
    else
        print_warning "Logs directory not found"
    fi
    
    # Backup SSL certificates
    if [ -d "ssl" ]; then
        print_status "Backing up SSL certificates..."
        cp -r ssl "$BACKUP_PATH/ssl"
        print_success "SSL certificates backed up"
    else
        print_warning "SSL certificates directory not found"
    fi
}

# Function to backup configuration
backup_config() {
    print_status "Backing up configuration files..."
    
    # Backup environment file
    if [ -f ".env" ]; then
        cp .env "$BACKUP_PATH/.env"
        print_success "Environment file backed up"
    else
        print_warning "Environment file not found"
    fi
    
    # Backup docker-compose file
    if [ -f "docker-compose.yml" ]; then
        cp docker-compose.yml "$BACKUP_PATH/docker-compose.yml"
        print_success "Docker Compose file backed up"
    fi
    
    # Backup nginx configuration
    if [ -f "nginx.conf" ]; then
        cp nginx.conf "$BACKUP_PATH/nginx.conf"
        print_success "Nginx configuration backed up"
    fi
}

# Function to create backup archive
create_archive() {
    print_status "Creating backup archive..."
    
    local archive_file="$BACKUP_DIR/$BACKUP_NAME.tar.gz"
    
    if tar -czf "$archive_file" -C "$BACKUP_DIR" "$BACKUP_NAME"; then
        print_success "Backup archive created: $archive_file"
        
        # Get archive size
        local archive_size=$(du -h "$archive_file" | cut -f1)
        print_status "Archive size: $archive_size"
        
        # Remove temporary directory
        rm -rf "$BACKUP_PATH"
        print_status "Temporary backup directory removed"
        
        echo "$archive_file"
    else
        print_error "Failed to create backup archive"
        return 1
    fi
}

# Function to cleanup old backups
cleanup_old_backups() {
    local keep_days=${1:-7}
    
    print_status "Cleaning up backups older than $keep_days days..."
    
    local deleted_count=0
    while IFS= read -r -d '' file; do
        rm "$file"
        ((deleted_count++))
        print_status "Deleted old backup: $(basename "$file")"
    done < <(find "$BACKUP_DIR" -name "appointments-backup-*.tar.gz" -type f -mtime +$keep_days -print0 2>/dev/null)
    
    if [ $deleted_count -gt 0 ]; then
        print_success "Cleaned up $deleted_count old backup(s)"
    else
        print_status "No old backups to clean up"
    fi
}

# Function to list existing backups
list_backups() {
    print_status "Existing backups:"
    
    if [ -d "$BACKUP_DIR" ] && [ "$(ls -A "$BACKUP_DIR" 2>/dev/null)" ]; then
        ls -lah "$BACKUP_DIR"/*.tar.gz 2>/dev/null | while read -r line; do
            echo "  $line"
        done
    else
        print_warning "No backups found in $BACKUP_DIR"
    fi
}

# Function to restore from backup
restore_backup() {
    local backup_file=$1
    
    if [ -z "$backup_file" ]; then
        print_error "Backup file not specified"
        echo "Usage: $0 restore <backup-file>"
        exit 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        print_error "Backup file not found: $backup_file"
        exit 1
    fi
    
    print_status "Restoring from backup: $backup_file"
    
    # Stop services
    print_status "Stopping services..."
    docker-compose down
    
    # Extract backup
    local temp_dir="/tmp/restore-$(date +%s)"
    mkdir -p "$temp_dir"
    tar -xzf "$backup_file" -C "$temp_dir"
    
    # Restore database
    print_status "Restoring database..."
    local db_file=$(find "$temp_dir" -name "database.sql" | head -1)
    if [ -f "$db_file" ]; then
        docker-compose up -d db
        sleep 10
        docker-compose exec -T db psql -U appointments -d appointments < "$db_file"
        print_success "Database restored"
    else
        print_error "Database backup not found in archive"
        exit 1
    fi
    
    # Restore application data
    print_status "Restoring application data..."
    if [ -d "$temp_dir/appointments-backup-*/uploads" ]; then
        cp -r "$temp_dir/appointments-backup-"*/uploads ./
        print_success "Uploads restored"
    fi
    
    if [ -d "$temp_dir/appointments-backup-*/logs" ]; then
        cp -r "$temp_dir/appointments-backup-"*/logs ./
        print_success "Logs restored"
    fi
    
    if [ -d "$temp_dir/appointments-backup-*/ssl" ]; then
        cp -r "$temp_dir/appointments-backup-"*/ssl ./
        print_success "SSL certificates restored"
    fi
    
    # Restore configuration
    if [ -f "$temp_dir/appointments-backup-"*/.env" ]; then
        cp "$temp_dir/appointments-backup-"*/.env ./
        print_success "Environment file restored"
    fi
    
    # Cleanup
    rm -rf "$temp_dir"
    
    # Start services
    print_status "Starting services..."
    docker-compose up -d
    
    print_success "Restore completed successfully"
}

# Main function
main() {
    case "${1:-backup}" in
        "backup")
            echo "💾 Creating backup..."
            create_backup_dir
            backup_database
            backup_app_data
            backup_config
            local archive_file=$(create_archive)
            cleanup_old_backups
            print_success "Backup completed: $archive_file"
            ;;
        "restore")
            restore_backup "$2"
            ;;
        "list")
            list_backups
            ;;
        "cleanup")
            cleanup_old_backups "${2:-7}"
            ;;
        "--help"|"-h")
            echo "Usage: $0 [backup|restore|list|cleanup] [options]"
            echo ""
            echo "Commands:"
            echo "  backup          Create a new backup (default)"
            echo "  restore <file>  Restore from backup file"
            echo "  list            List existing backups"
            echo "  cleanup [days]  Clean up backups older than specified days (default: 7)"
            echo ""
            echo "Examples:"
            echo "  $0 backup                    # Create a new backup"
            echo "  $0 restore backup.tar.gz    # Restore from backup"
            echo "  $0 list                      # List existing backups"
            echo "  $0 cleanup 30               # Clean up backups older than 30 days"
            ;;
        *)
            print_error "Unknown command: $1"
            echo "Use '$0 --help' for usage information"
            exit 1
            ;;
    esac
}

main "$@"
