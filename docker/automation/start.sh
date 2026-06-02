#!/bin/bash

# start.sh - Start Docker environment
# This script builds and starts the Docker containers for the Ville development environment.

# Navigate to docker directory regardless of where script is called from
cd "$(dirname "$0")/.."

echo "🚀 Starting Ville Docker environment..."

# Build and start containers
docker-compose up -d --build

# Wait for database
echo "⏳ Waiting for database..."
sleep 15

# Install PHP dependencies if vendor doesn't exist
if [ ! -d ../../vendor ]; then
    echo "📦 Installing PHP dependencies..."
    docker-compose exec app composer install --no-dev --optimize-autoloader
fi

# Install Node dependencies if node_modules doesn't exist
if [ ! -d ../../node_modules ]; then
    echo "📦 Installing Node dependencies..."
    docker-compose exec app npm install
fi

# Run Laravel setup
echo "🔧 Setting up Laravel..."
docker-compose exec app php artisan key:generate --ansi

# Create storage symlink
echo "🔗 Creating storage symlink..."
docker-compose exec app php artisan storage:link

# Clear any existing caches
echo "🧹 Clearing existing caches..."
docker-compose exec app php artisan config:clear
docker-compose exec app php artisan route:clear
docker-compose exec app php artisan view:clear
docker-compose exec app php artisan cache:clear

# Ensure views directory exists
echo "📁 Ensuring views directory exists..."
docker-compose exec app mkdir -p resources/views

# Optimize Laravel
echo "⚡ Optimizing Laravel..."
docker-compose exec app php artisan config:cache
docker-compose exec app php artisan route:cache

# Cache views if they exist
if [ "$(docker-compose exec app find resources/views -name '*.blade.php' | wc -l)" -gt 0 ]; then
    echo "📋 Caching views..."
    docker-compose exec app php artisan view:cache
else
    echo "⚠️  No views found, skipping view cache"
fi

# Run migrations
echo "🗄️  Running migrations..."
docker-compose exec app php artisan migrate --force

# Seed database
echo "🌱 Seeding database..."
if docker-compose exec app php artisan db:seed --force; then
    echo "✅ Database seeded successfully"
else
    echo "⚠️  Seeding failed - database may already contain data"
    echo "💡 Run: docker-compose exec app php artisan migrate:fresh --seed"
fi

# Build frontend assets
echo "🎨 Building assets..."
docker-compose exec app npm run build

echo "✅ Environment is ready!"
echo ""
echo "🌐 Access your application:"
echo "  • Main site:    http://localhost"
echo "  • HTTPS:        https://localhost (accept self-signed cert)"
echo "  • Direct PHP:   http://localhost:8080"
echo "  • WebSocket:    wss://localhost:8081"
echo ""
echo "🔧 Useful commands:"
echo "  • View logs:      ./docker/automation/logs.sh {app|nginx|reverb|varnish|queue}"
echo "  • Health check:   ./docker/automation/health.sh"
echo "  • Reset database: docker-compose -f docker/docker-compose.yml exec app php artisan migrate:fresh --seed"
echo "  • Clear caches:   docker-compose -f docker/docker-compose.yml exec app php artisan optimize:clear"
echo ""