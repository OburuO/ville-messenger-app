#!/bin/bash

# logs.sh - View Docker service logs
# This script allows you to view logs for specific Docker services.

# Navigate to docker directory regardless of where script is called from
cd "$(dirname "$0")/.."

case "$1" in
    "app")
        docker-compose logs -f app
        ;;
    "nginx")
        docker-compose logs -f nginx
        ;;
    "reverb")
        docker-compose logs -f reverb
        ;;
    "varnish")
        docker-compose logs -f varnish
        ;;
    "queue")
        docker-compose logs -f queue
        ;;
    "db")
        docker-compose logs -f db
        ;;
    "redis")
        docker-compose logs -f redis
        ;;
    "all")
        docker-compose logs -f
        ;;
    *)
        echo "Usage: $0 {app|nginx|reverb|varnish|queue|db|redis|all}"
        echo ""
        echo "Examples:"
        echo "  ./docker/automation/logs.sh app      # Laravel app logs"
        echo "  ./docker/automation/logs.sh reverb   # WebSocket logs"
        echo "  ./docker/automation/logs.sh all      # All service logs"
        ;;
esac