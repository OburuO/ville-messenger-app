#!/bin/bash

# setup.sh - Setup development environment
# This script sets up the necessary directories, generates SSL certificates, and creates a .env file for the Ville development environment.

echo "🚀 Setting up Ville development environment..."

# Create necessary directories
mkdir -p nginx ssl varnish storage/mysql storage/redis 

# Generate self-signed SSL certificate for development
if [ ! -f ssl/cert.pem ]; then
    echo "📜 Generating SSL certificates..."
    openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes \
        -subj "/C=KE/ST=Nairobi/L=Nairobi/O=Ville Dev/CN=localhost"
    echo "✅ SSL certificates generated"
fi

# Create environment file if it doesn't exist
if [ ! -f ../.env ]; then
    echo "📝 Creating .env file..."
    cp ../.env.example ../.env
    
    # Update database settings for Docker
    sed -i 's/DB_HOST=127.0.0.1/DB_HOST=db/' ../.env
    sed -i 's/DB_DATABASE=laravel/DB_DATABASE=socioville/' ../.env
    sed -i 's/DB_USERNAME=root/DB_USERNAME=root/' ../.env
    sed -i 's/DB_PASSWORD=/DB_PASSWORD=root/' ../.env
    
    # Update Redis settings
    sed -i 's/REDIS_HOST=127.0.0.1/REDIS_HOST=redis/' ../.env
    
    # Update Reverb settings
    echo "" >> ../.env
    echo "# Reverb Broadcasting" >> ../.env
    echo "REVERB_APP_ID=ville-app" >> ../.env
    echo "REVERB_APP_KEY=ville-key" >> ../.env
    echo "REVERB_APP_SECRET=ville-secret" >> ../.env
    echo "REVERB_HOST=localhost" >> ../.env
    echo "REVERB_PORT=8081" >> ../.env
    echo "REVERB_SCHEME=https" >> ../.env
    
    echo "✅ Environment file created"
fi

# Create a .env file for Docker Compose with proper user settings
if [ ! -f .env ]; then
    echo "📝 Creating Docker .env file..."
    cat > .env << EOF
# Docker environment variables
WWWUSER=$(id -u)
WWWGROUP=$(id -g)
USER=ville_user
EOF
    echo "✅ Docker .env file created"
fi

# Set proper permissions
chmod 600 ssl/key.pem
chmod 644 ssl/cert.pem
chmod -R 775 storage
chmod -R 775 ../storage ../bootstrap/cache

echo "🎉 Setup complete!"
echo ""
echo "🌐 Available services:"
echo "  • Main site: http://localhost (or https://localhost)"
echo "  • Direct PHP: http://localhost:8080"
echo "  • WebSocket: wss://localhost:8081"
echo "  • Varnish: http://localhost:8080"
echo "  • MySQL: localhost:3306"
echo "  • Redis: localhost:6379"
echo ""
echo "📋 Next steps:"
echo "  1. Run: docker-compose up -d"
echo "  2. Run: docker-compose exec app composer install"
echo "  3. Run: docker-compose exec app php artisan migrate"
echo "  4. Run: docker-compose exec app php artisan key:generate"
echo ""