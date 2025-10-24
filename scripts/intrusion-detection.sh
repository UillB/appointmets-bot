#!/bin/bash

# Intrusion Detection Script for Appointments Bot
# This script detects potential security threats

echo "🛡️ Intrusion Detection - $(date)"
echo "================================"

# Check for suspicious processes
echo "Checking for suspicious processes..."
docker exec appointments-bot-backend-1 ps aux | grep -E "(nc|netcat|wget|curl|python|perl|bash|sh)" | grep -v "node\|npm"

# Check for unusual network connections
echo ""
echo "Checking network connections..."
docker exec appointments-bot-backend-1 netstat -tuln | grep -E "(LISTEN|ESTABLISHED)" | grep -v "127.0.0.1\|::1"

# Check for file system anomalies
echo ""
echo "Checking file system anomalies..."
docker exec appointments-bot-backend-1 find /app -type f -name "*.sh" -o -name "*.py" -o -name "*.pl" | grep -v "node_modules"

# Check for privilege escalation attempts
echo ""
echo "Checking for privilege escalation attempts..."
docker exec appointments-bot-backend-1 grep -r "sudo\|su\|chmod\|chown" /app 2>/dev/null | head -5

# Check for suspicious log entries
echo ""
echo "Checking for suspicious log entries..."
docker logs appointments-bot-backend-1 2>&1 | grep -E "(error|failed|unauthorized|forbidden|attack|injection)" | tail -10

echo ""
echo "Intrusion detection completed"
