#!/bin/bash

# docker-start.sh - Start Docker environment
# This script builds and starts the Docker containers for the Ville development environment.

echo "🚀 Starting Ville Docker environment..."

# Build and start containers
docker-compose up -d --build

# Wait for database
echo "⏳ Waiting for database..." 
sleep 15

# Install dependencies if vendor doesn't exist
if [ ! -d ../vendor ]; then
    echo "📦 Installing PHP dependencies..."
    docker-compose exec app composer install --no-dev --optimize-autoloader
fi

# Install node dependencies if node_modules doesn't exist 
if [ ! -d ../node_modules ]; then
    echo "📦 Installing Node dependencies..."
    docker-compose exec app npm install
fi

# Run Laravel setup
echo "🔧 Setting up Laravel..."
docker-compose exec app php artisan key:generate --ansi

# Create storage symlink first
echo "🔗 Creating storage symlink..."
docker-compose exec app php artisan storage:link

# Clear any existing caches to avoid conflicts
echo "🧹 Clearing existing caches..."
docker-compose exec app php artisan config:clear
docker-compose exec app php artisan route:clear  
docker-compose exec app php artisan view:clear
docker-compose exec app php artisan cache:clear

# Check if views directory exists, create if not
echo "📁 Ensuring views directory exists..."
docker-compose exec app mkdir -p resources/views

# Now run cache commands
echo "⚡ Optimizing Laravel..."
docker-compose exec app php artisan config:cache
docker-compose exec app php artisan route:cache

# Only cache views if views directory has content
if [ "$(docker-compose exec app find resources/views -name '*.blade.php' | wc -l)" -gt 0 ]; then
    echo "📋 Caching views..."
    docker-compose exec app php artisan view:cache
else
    echo "⚠️  No views found, skipping view cache"
fi

# Run migrations (without --seed to avoid duplicates)
echo "🗄️  Running migrations..."
docker-compose exec app php artisan migrate --force

# Run seeds separately with better error handling
echo "🌱 Seeding database..."
if docker-compose exec app php artisan db:seed --force; then
    echo "✅ Database seeded successfully"
else
    echo "⚠️  Seeding failed - database may already contain data"
    echo "💡 Run 'docker-compose exec app php artisan migrate:fresh --seed' to reset"
fi

# Build assets
echo "🎨 Building assets..."
docker-compose exec app npm run build

echo "✅ Environment is ready!"
echo ""
echo "🌐 Access your application:"
echo "  • Main site: http://localhost"
echo "  • HTTPS site: https://localhost (accept self-signed cert)"
echo "  • Direct PHP: http://localhost:8080"
echo "  • WebSocket test: wss://localhost:8081"
echo ""
echo "🔧 Useful commands:"
echo "  • Reset database: docker-compose exec app php artisan migrate:fresh --seed"
echo "  • Clear all caches: docker-compose exec app php artisan optimize:clear"
echo "  • View logs: docker-compose logs -f app"
echo ""