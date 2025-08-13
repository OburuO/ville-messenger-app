#!/bin/bash

# docker-health.sh - Health check for Ville Docker environment
# This script checks the status of all services and common issues

echo "🔍 Ville Docker Environment Health Check"
echo "======================================="

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

# Check if database is ready
echo ""
echo "🗄️  Database Status:"
if docker-compose exec -T db mysql -u root -e "SELECT 1" > /dev/null 2>&1; then
    echo "✅ Database is accessible"
else
    echo "❌ Database is not accessible"
fi

# Check Laravel application status
echo ""
echo "🚀 Laravel Status:"

# Check if .env exists
if docker-compose exec -T app test -f .env; then
    echo "✅ .env file exists"
else
    echo "❌ .env file missing"
fi

# Check if vendor exists
if docker-compose exec -T app test -d vendor; then
    echo "✅ Composer dependencies installed"
else
    echo "❌ Composer dependencies missing - run: docker-compose exec app composer install"
fi

# Check if key is generated
if docker-compose exec -T app php artisan key:generate --show 2>/dev/null | grep -q "base64:"; then
    echo "✅ Application key is set"
else
    echo "❌ Application key not set - run: docker-compose exec app php artisan key:generate"
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
if docker-compose exec -T app test -w storage; then
    echo "✅ Storage directory is writable"
else
    echo "❌ Storage directory not writable"
fi

# Check if views directory exists
if docker-compose exec -T app test -d resources/views; then
    echo "✅ Views directory exists"
    VIEW_COUNT=$(docker-compose exec -T app find resources/views -name "*.blade.php" | wc -l)
    echo "   📋 Found $VIEW_COUNT view files"
else
    echo "❌ Views directory missing"
fi

# Check logs for recent errors
echo ""
echo "🚨 Recent Errors (last 10):"
docker-compose logs --tail=10 app | grep -i error || echo "   No recent errors found"

echo ""
echo "🔧 Quick Fixes:"
echo "   • Reset everything: docker-compose down -v && ./docker-start.sh"
echo "   • Reset database: docker-compose exec app php artisan migrate:fresh --seed"
echo "   • Clear caches: docker-compose exec app php artisan optimize:clear"
echo "   • View logs: docker-compose logs -f app"
echo "   • Shell access: docker-compose exec app bash"