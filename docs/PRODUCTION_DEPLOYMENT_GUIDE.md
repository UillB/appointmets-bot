# 🚀 Production Deployment Guide - Appointments Bot

**Version:** 1.0.0  
**Last Updated:** January 18, 2025  
**Status:** Production Ready

## 📋 Overview

This guide provides comprehensive instructions for deploying the Appointments Bot system to production. The system has been thoroughly tested and optimized for production deployment.

## 🎯 System Architecture

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
│   (React)       │    │   (Webhook)     │
└─────────────────┘    └─────────────────┘
```

## 🔧 Prerequisites

### System Requirements
- **OS:** Linux (Ubuntu 20.04+ recommended)
- **RAM:** 4GB minimum, 8GB recommended
- **CPU:** 2 cores minimum, 4 cores recommended
- **Storage:** 20GB minimum, 50GB recommended
- **Network:** Stable internet connection

### Software Requirements
- **Docker:** 20.10+
- **Docker Compose:** 2.0+
- **Node.js:** 20+ (for development)
- **PostgreSQL:** 15+ (if not using Docker)

## 📦 Installation

### 1. Clone Repository
```bash
git clone https://github.com/your-org/appointments-bot.git
cd appointments-bot
```

### 2. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

### 3. Required Environment Variables
```bash
# Database
DATABASE_URL=postgresql://appointments:appointments_password@db:5432/appointments

# JWT Secret (generate a strong secret)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Telegram Bot Token
TELEGRAM_BOT_TOKEN=your-telegram-bot-token

# Web App URL
WEBAPP_URL=https://your-domain.com

# Public Base URL
PUBLIC_BASE_URL=https://your-domain.com
```

### 4. SSL/TLS Configuration
```bash
# Create SSL directory
mkdir -p ssl

# Copy your SSL certificates
cp your-cert.pem ssl/cert.pem
cp your-key.pem ssl/key.pem
```

## 🚀 Deployment

### Option 1: Docker Compose (Recommended)

#### 1. Start Services
```bash
# Start all services
docker compose up -d

# Check status
docker compose ps
```

#### 2. Initialize Database
```bash
# Run database migrations
docker compose exec backend npx prisma db push

# Seed database (optional)
docker compose exec backend npx prisma db seed
```

#### 3. Verify Deployment
```bash
# Check health endpoints
curl http://localhost:4000/api/health
curl http://localhost:4000/api/health/websocket

# Check frontend
curl http://localhost:4200

# Check nginx proxy
curl http://localhost:80
```

### Option 2: Secure Docker Compose

#### 1. Use Secure Configuration
```bash
# Use secure Docker Compose configuration
docker compose -f docker-compose-secure.yml up -d
```

#### 2. Apply Security Hardening
```bash
# Run security hardening script
./scripts/security-hardening.sh
```

## 🔒 Security Configuration

### 1. SSL/TLS Setup
```bash
# Generate SSL certificates (if not using existing ones)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/key.pem -out ssl/cert.pem
```

### 2. Firewall Configuration
```bash
# Allow only necessary ports
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp
ufw enable
```

### 3. Security Headers
The system includes comprehensive security headers:
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Content-Security-Policy: configured
- Strict-Transport-Security: max-age=31536000

## 📊 Monitoring

### 1. Health Monitoring
```bash
# Run health check
./scripts/monitor.sh

# Check container status
docker ps
```

### 2. Performance Monitoring
```bash
# Run performance test
./scripts/performance-test.sh

# Monitor resource usage
docker stats
```

### 3. Security Monitoring
```bash
# Run security audit
./scripts/security-audit.sh

# Check for intrusions
./scripts/intrusion-detection.sh
```

## 🔄 Backup and Recovery

### 1. Automated Backups
```bash
# Run encrypted backup
./scripts/backup-encrypted.sh

# Schedule regular backups
crontab -e
# Add: 0 2 * * * /path/to/appointments-bot/scripts/backup-encrypted.sh
```

### 2. Manual Backup
```bash
# Database backup
docker compose exec db pg_dump -U appointments appointments > backup.sql

# Application data backup
tar -czf app-data.tar.gz ./backend/prisma ./backend/data
```

### 3. Recovery
```bash
# Restore database
docker compose exec -T db psql -U appointments appointments < backup.sql

# Restore application data
tar -xzf app-data.tar.gz
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Container Won't Start
```bash
# Check logs
docker compose logs backend
docker compose logs frontend
docker compose logs db
docker compose logs nginx

# Restart services
docker compose restart
```

#### 2. Database Connection Issues
```bash
# Check database status
docker compose exec db pg_isready -U appointments

# Check database logs
docker compose logs db
```

#### 3. SSL Certificate Issues
```bash
# Check certificate validity
openssl x509 -in ssl/cert.pem -text -noout

# Test SSL connection
openssl s_client -connect your-domain.com:443
```

#### 4. Performance Issues
```bash
# Check resource usage
docker stats

# Run performance test
./scripts/performance-test.sh

# Check logs for errors
docker compose logs --tail=100
```

### Log Locations
- **Backend:** `docker compose logs backend`
- **Frontend:** `docker compose logs frontend`
- **Database:** `docker compose logs db`
- **Nginx:** `docker compose logs nginx`

## 📈 Performance Optimization

### 1. Database Optimization
```bash
# Analyze database performance
docker compose exec db psql -U appointments -d appointments -c "ANALYZE;"

# Check database statistics
docker compose exec db psql -U appointments -d appointments -c "SELECT * FROM pg_stat_activity;"
```

### 2. Memory Optimization
```bash
# Monitor memory usage
docker stats --no-stream

# Optimize memory limits
docker compose down
docker compose up -d
```

### 3. Network Optimization
```bash
# Check network connectivity
docker network ls
docker network inspect appointments-bot_appointments-network
```

## 🔧 Maintenance

### 1. Regular Updates
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Docker images
docker compose pull
docker compose up -d
```

### 2. Log Rotation
```bash
# Set up log rotation
sudo nano /etc/logrotate.d/appointments-bot
```

### 3. Security Updates
```bash
# Run security audit
./scripts/security-audit.sh

# Apply security patches
sudo apt update && sudo apt upgrade -y
```

## 📋 Production Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Firewall configured
- [ ] Database migrations run
- [ ] Security audit passed
- [ ] Performance test passed
- [ ] Load test passed

### Post-Deployment
- [ ] Health checks passing
- [ ] Monitoring configured
- [ ] Backups scheduled
- [ ] Log rotation configured
- [ ] Alerting set up
- [ ] Documentation updated

## 🆘 Support

### Emergency Contacts
- **System Administrator:** admin@your-domain.com
- **Technical Support:** support@your-domain.com
- **Emergency Hotline:** +1-XXX-XXX-XXXX

### Documentation
- **API Documentation:** `/docs/api/README.md`
- **Architecture Guide:** `/docs/architecture/README.md`
- **Development Guide:** `/docs/development/README.md`

### Monitoring Dashboards
- **Health Dashboard:** `https://your-domain.com/health`
- **Performance Dashboard:** `https://your-domain.com/metrics`
- **Security Dashboard:** `https://your-domain.com/security`

## 🎉 Success Metrics

### Performance Targets
- **Response Time:** < 100ms (95th percentile)
- **Availability:** 99.9% uptime
- **Memory Usage:** < 1GB per service
- **CPU Usage:** < 50% per service

### Security Targets
- **Security Score:** 95%+
- **Vulnerability Scan:** 0 critical issues
- **Penetration Test:** Passed
- **Compliance:** SOC 2 Type II

## 📚 Additional Resources

- **Docker Documentation:** https://docs.docker.com/
- **PostgreSQL Documentation:** https://www.postgresql.org/docs/
- **Nginx Documentation:** https://nginx.org/en/docs/
- **Node.js Documentation:** https://nodejs.org/docs/
- **React Documentation:** https://react.dev/

---

**🎉 Congratulations! Your Appointments Bot system is now ready for production deployment.**

For additional support or questions, please refer to the documentation or contact the development team.
