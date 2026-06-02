#!/bin/bash

# health.sh - Health check for Ville Docker environment
# This script checks the status of all services and common issues.

# Navigate to docker directory regardless of where script is called from
cd "$(dirname "$0")/.."

echo "🔍 Ville Docker Environment Health Check"
echo "========================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running"
    exit 1
fi
echo "✅ Docker is running"

# Check container status
echo ""
echo "📦 Container Status:"
docker-compose ps

# Check database accessibility
echo ""
echo "🗄️  Database Status:"
if docker-compose exec -T db mysql -u root -e "SELECT 1" > /dev/null 2>&1; then
    echo "✅ Database is accessible"
else
    echo "❌ Database is not accessible"
fi

# Check Laravel application
echo ""
echo "🚀 Laravel Status:"

if docker-compose exec -T app test -f ../../.env; then
    echo "✅ .env file exists"
else
    echo "❌ .env file missing — run: ./docker/automation/setup.sh"
fi

if docker-compose exec -T app test -d ../../vendor; then
    echo "✅ Composer dependencies installed"
else
    echo "❌ Composer dependencies missing — run: docker-compose exec app composer install"
fi

if docker-compose exec -T app php artisan key:generate --show 2>/dev/null | grep -q "base64:"; then
    echo "✅ Application key is set"
else
    echo "❌ Application key not set — run: docker-compose exec app php artisan key:generate"
fi

# Check database connection
echo ""
echo "🔌 Database Connection:"
if docker-compose exec -T app php artisan migrate:status > /dev/null 2>&1; then
    echo "✅ Database connection working"
else
    echo "❌ Database connection failed"
fi

# Check storage permissions
echo ""
echo "📁 Storage Permissions:"
if docker-compose exec -T app test -w ../../storage; then
    echo "✅ Storage directory is writable"
else
    echo "❌ Storage directory not writable"
fi

# Check views
if docker-compose exec -T app test -d ../../resources/views; then
    VIEW_COUNT=$(docker-compose exec -T app find ../../resources/views -name "*.blade.php" | wc -l)
    echo "✅ Views directory exists ($VIEW_COUNT view files)"
else
    echo "❌ Views directory missing"
fi

# Recent errors
echo ""
echo "🚨 Recent Errors (last 10):"
docker-compose logs --tail=10 app | grep -i error || echo "   No recent errors found"

echo ""
echo "🔧 Quick Fixes:"
echo "  • Full reset:      docker-compose down -v && ./docker/automation/start.sh"
echo "  • Reset database:  docker-compose exec app php artisan migrate:fresh --seed"
echo "  • Clear caches:    docker-compose exec app php artisan optimize:clear"
echo "  • View logs:       ./docker/automation/logs.sh all"
echo "  • Shell access:    docker-compose exec app bash"
echo ""