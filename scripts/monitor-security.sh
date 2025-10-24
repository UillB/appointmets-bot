#!/bin/bash

# Security Monitoring Script for Appointments Bot
# This script monitors security events and logs

echo "🔍 Security Monitoring - $(date)"
echo "================================"

# Monitor failed login attempts
echo "Failed Login Attempts:"
docker logs appointments-bot-backend-1 2>&1 | grep -i "failed\|error\|unauthorized" | tail -10

# Monitor suspicious requests
echo ""
echo "Suspicious Requests:"
docker logs appointments-bot-nginx-1 2>&1 | grep -E "(40[0-9]|50[0-9])" | tail -10

# Monitor resource usage
echo ""
echo "Resource Usage:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

# Monitor network connections
echo ""
echo "Network Connections:"
docker exec appointments-bot-backend-1 netstat -tuln 2>/dev/null | head -10

# Monitor file system changes
echo ""
echo "Recent File Changes:"
docker exec appointments-bot-backend-1 find /app -type f -mtime -1 2>/dev/null | head -10

# Check for security updates
echo ""
echo "Security Updates Available:"
docker exec appointments-bot-backend-1 npm audit 2>/dev/null | grep -E "(high|critical)" || echo "No critical vulnerabilities found"

echo ""
echo "Security monitoring completed"
