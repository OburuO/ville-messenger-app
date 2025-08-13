# Dockerfile
FROM php:8.2-fpm

ARG USER
ARG USER_ID
ARG GROUP_ID

WORKDIR /var/www

# Install system dependencies
RUN apt update && apt install -y \
    git \
    zip \
    unzip \  
    curl \
    vim \
    libicu-dev \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libzip-dev \
    libonig-dev \
    libxml2-dev \
    supervisor \
    cron \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 20
RUN curl -sL https://deb.nodesource.com/setup_20.x | bash \
    && apt install nodejs -y

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Configure and install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg
RUN docker-php-ext-configure intl
RUN docker-php-ext-install \
    pdo \
    pdo_mysql \
    intl \
    gd \
    zip \
    mbstring \
    xml \
    bcmath \
    opcache \
    pcntl
    
# Install PECL extensions
RUN pecl install xdebug redis \
    && docker-php-ext-enable xdebug redis

# Copy XDebug configuration
COPY xdebug.ini "${PHP_INI_DIR}/conf.d"

# Copy PHP configuration
COPY local.ini "${PHP_INI_DIR}/conf.d"

# Copy supervisor configuration for queue workers
COPY supervisor.conf /etc/supervisor/conf.d/laravel.conf

# Create user and group with better logic
RUN if [ "${USER}" != "root" ]; then \
        if ! getent group ${USER} > /dev/null 2>&1; then \
            groupadd -g ${GROUP_ID} ${USER}; \
        fi && \
        if ! getent passwd ${USER} > /dev/null 2>&1; then \
            useradd -u ${USER_ID} -g ${GROUP_ID} -m -s /bin/bash ${USER}; \
        fi; \
    fi

# Create directories for Laravel with proper permissions
RUN mkdir -p /var/www/storage/logs \
             /var/www/storage/framework/cache \
             /var/www/storage/framework/sessions \
             /var/www/storage/framework/views \
             /var/www/bootstrap/cache

# Set ownership based on user
RUN if [ "${USER}" != "root" ]; then \
        chown -R ${USER}:${USER} /var/www; \
    else \
        chown -R www-data:www-data /var/www; \
    fi

# Switch to user (only if not root)
RUN if [ "${USER}" != "root" ]; then \
        echo "Switching to user: ${USER}"; \
    fi

USER ${USER_ID}:${GROUP_ID}

# Set default command
CMD ["php-fpm"]