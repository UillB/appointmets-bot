# 🚀 Deployment Documentation - Appointments Bot

This directory contains comprehensive deployment guides and operational documentation for the Appointments Bot system.

## 📋 Deployment Overview

### Supported Environments
- **Development:** Local development setup
- **Staging:** Testing and QA environment
- **Production:** Live production deployment

### Deployment Methods
- **Docker:** Containerized deployment
- **Manual:** Traditional server deployment
- **Cloud:** Cloud platform deployment

## 🏗️ Architecture

### Production Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   Web Server    │    │   Database      │
│   (Nginx)       │◄──►│   (Node.js)     │◄──►│   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   Static Files  │    │   Telegram Bot  │
│   (Angular)     │    │   (Webhook)     │
└─────────────────┘    └─────────────────┘
```

## 🐳 Docker Deployment

### Prerequisites
- Docker 20.x+
- Docker Compose 2.x+
- 2GB+ RAM
- 10GB+ disk space

### Quick Start
```bash
# Clone repository
git clone <repository-url>
cd appointments-bot

# Configure environment
cp .env.example .env
# Edit .env with your configuration

# Build and start
docker-compose up -d

# Check status
docker-compose ps
```

### Environment Configuration
```bash
# .env file
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://user:password@db:5432/appointments
JWT_SECRET=your-super-secret-jwt-key
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
PUBLIC_BASE_URL=https://your-domain.com
```

### Docker Services
```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:password@db:5432/appointments
    depends_on:
      - db

  frontend:
    build: ./admin-panel
    ports:
      - "80:80"
    depends_on:
      - backend

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=appointments
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## 🖥️ Manual Deployment

### Server Requirements
- **OS:** Ubuntu 20.04+ or CentOS 8+
- **RAM:** 2GB minimum, 4GB recommended
- **CPU:** 2 cores minimum
- **Storage:** 20GB+ SSD
- **Network:** Public IP with domain

### Backend Deployment
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Clone repository
git clone <repository-url>
cd appointments-bot/backend

# Install dependencies
npm install

# Configure database
sudo -u postgres createdb appointments
sudo -u postgres createuser --interactive

# Run migrations
npx prisma migrate deploy

# Start application
npm start
```

### Frontend Deployment
```bash
# Install dependencies
cd admin-panel
npm install

# Build for production
npm run build

# Install Nginx
sudo apt-get install nginx

# Configure Nginx
sudo cp nginx.conf /etc/nginx/sites-available/appointments
sudo ln -s /etc/nginx/sites-available/appointments /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /path/to/admin-panel/dist/admin-panel;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Web App
    location /webapp {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## ☁️ Cloud Deployment

### AWS Deployment
```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure AWS
aws configure

# Deploy with ECS
aws ecs create-cluster --cluster-name appointments-cluster
aws ecs register-task-definition --cli-input-json file://task-definition.json
aws ecs create-service --cluster appointments-cluster --service-name appointments-service --task-definition appointments-task
```

### Google Cloud Deployment
```bash
# Install gcloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Configure gcloud
gcloud init

# Deploy with Cloud Run
gcloud run deploy appointments-backend --source ./backend
gcloud run deploy appointments-frontend --source ./admin-panel
```

### DigitalOcean Deployment
```bash
# Create droplet
doctl compute droplet create appointments-server \
  --image ubuntu-20-04-x64 \
  --size s-2vcpu-4gb \
  --region nyc1

# Deploy application
ssh root@your-droplet-ip
# Follow manual deployment steps
```

## 🔒 SSL/HTTPS Setup

### Let's Encrypt (Free SSL)
```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Commercial SSL
```bash
# Install certificate
sudo cp your-certificate.crt /etc/ssl/certs/
sudo cp your-private-key.key /etc/ssl/private/
sudo cp your-ca-bundle.crt /etc/ssl/certs/

# Update Nginx configuration
server {
    listen 443 ssl;
    ssl_certificate /etc/ssl/certs/your-certificate.crt;
    ssl_certificate_key /etc/ssl/private/your-private-key.key;
    ssl_trusted_certificate /etc/ssl/certs/your-ca-bundle.crt;
}
```

## 📊 Monitoring & Logging

### Application Monitoring
```bash
# Install PM2
npm install -g pm2

# Start application with PM2
pm2 start backend/src/server.ts --name "appointments-backend"
pm2 start admin-panel/dist/admin-panel --name "appointments-frontend"

# Monitor
pm2 monit
pm2 logs
```

### Log Management
```bash
# Configure log rotation
sudo nano /etc/logrotate.d/appointments

# Log rotation configuration
/var/log/appointments/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
}
```

### Health Checks
```bash
# Backend health check
curl http://localhost:4000/api/health

# Frontend health check
curl http://localhost:4200

# Database health check
psql -h localhost -U user -d appointments -c "SELECT 1;"
```

## 🔄 Backup & Recovery

### Database Backup
```bash
# Create backup
pg_dump -h localhost -U user appointments > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
psql -h localhost -U user appointments < backup_20250118_120000.sql

# Automated backup script
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h localhost -U user appointments > $BACKUP_DIR/backup_$DATE.sql
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
```

### Application Backup
```bash
# Backup application files
tar -czf app_backup_$(date +%Y%m%d_%H%M%S).tar.gz \
  /path/to/appointments-bot \
  --exclude=node_modules \
  --exclude=.git

# Backup configuration
cp /etc/nginx/sites-available/appointments nginx_backup.conf
cp .env env_backup.conf
```

## 🚨 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check database status
sudo systemctl status postgresql

# Check connection
psql -h localhost -U user -d appointments

# Reset database
npx prisma migrate reset
```

#### Application Won't Start
```bash
# Check logs
pm2 logs appointments-backend
journalctl -u nginx

# Check ports
netstat -tlnp | grep :4000
netstat -tlnp | grep :80

# Check permissions
ls -la /path/to/appointments-bot
```

#### SSL Certificate Issues
```bash
# Check certificate
openssl x509 -in /etc/ssl/certs/your-certificate.crt -text -noout

# Test SSL
curl -I https://your-domain.com

# Renew certificate
sudo certbot renew
```

### Performance Issues
```bash
# Check system resources
htop
df -h
free -h

# Check application performance
pm2 monit
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:4000/api/health
```

## 📚 Related Documentation

- [Architecture](../architecture/) - System design
- [Development Guides](../development/) - Development workflows
- [API Documentation](../api/) - API reference

## 🔄 Deployment Checklist

### Pre-deployment
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] SSL certificates obtained
- [ ] Domain DNS configured
- [ ] Backup strategy in place

### Deployment
- [ ] Application built and tested
- [ ] Database deployed and migrated
- [ ] Web server configured
- [ ] SSL certificates installed
- [ ] Health checks passing

### Post-deployment
- [ ] Monitoring configured
- [ ] Logs being collected
- [ ] Backup schedule active
- [ ] Performance baseline established
- [ ] Documentation updated

---

*Deployment Documentation - Production deployment and operations* 🚀
