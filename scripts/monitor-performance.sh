#!/bin/bash
echo "📊 Performance Monitor - $(date)"
echo "================================"

# Container stats
echo "Container Resource Usage:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"

# API response time
echo ""
echo "API Response Time:"
curl -s -w "Health endpoint: %{time_total}s\n" -o /dev/null http://localhost:4000/api/health
curl -s -w "WebSocket health: %{time_total}s\n" -o /dev/null http://localhost:4000/api/health/websocket

# Memory usage
echo ""
echo "Memory Usage:"
free -h

# Disk usage
echo ""
echo "Disk Usage:"
df -h | head -5
