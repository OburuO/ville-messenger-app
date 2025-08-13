#!/bin/bash

# docker-logs.sh - View Docker service logs
# This script allows you to view logs for specific Docker services.

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
    *)
        echo "Usage: $0 {app|nginx|reverb|varnish|queue}"
        echo "Or run: docker-compose logs -f [service]"
        ;;
esac