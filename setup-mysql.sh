#!/bin/bash

# MySQL Installation and Setup Script for ReviewLoop Backend

echo "🔧 Setting up MySQL for ReviewLoop Backend..."

# Check if MySQL server is already installed
if systemctl is-active --quiet mysql 2>/dev/null || systemctl is-active --quiet mysqld 2>/dev/null; then
    echo "✅ MySQL server is already running!"
    mysql --version
else
    echo "📦 Installing MySQL server..."
    echo "Please run the following commands:"
    echo ""
    echo "1. Update package list:"
    echo "   sudo apt update"
    echo ""
    echo "2. Install MySQL server:"
    echo "   sudo apt install -y mysql-server"
    echo ""
    echo "3. Secure MySQL installation (optional but recommended):"
    echo "   sudo mysql_secure_installation"
    echo ""
    echo "4. Start MySQL service:"
    echo "   sudo systemctl start mysql"
    echo "   sudo systemctl enable mysql"
    echo ""
    echo "After installation, run this script again to set up the database."
    exit 0
fi

# Check if MySQL is accessible
if ! mysql -u root -e "SELECT 1" 2>/dev/null; then
    echo ""
    echo "⚠️  MySQL root access requires password or sudo."
    echo "Trying with sudo..."
    
    # Create database and user
    echo "Creating database and user..."
    sudo mysql <<EOF
CREATE DATABASE IF NOT EXISTS reviewloop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'reviewloop_user'@'localhost' IDENTIFIED BY 'reviewloop_password';
GRANT ALL PRIVILEGES ON reviewloop.* TO 'reviewloop_user'@'localhost';
FLUSH PRIVILEGES;
SELECT 'Database and user created successfully!' AS Status;
EOF

    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Database setup complete!"
        echo ""
        echo "📝 Update your .env file with these credentials:"
        echo "   DB_HOST=localhost"
        echo "   DB_USER=reviewloop_user"
        echo "   DB_PASSWORD=reviewloop_password"
        echo "   DB_NAME=reviewloop"
        echo ""
        echo "⚠️  Remember to change the password in production!"
    else
        echo "❌ Database setup failed. Please check MySQL installation."
        exit 1
    fi
else
    # MySQL accessible without sudo
    mysql -u root <<EOF
CREATE DATABASE IF NOT EXISTS reviewloop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'reviewloop_user'@'localhost' IDENTIFIED BY 'reviewloop_password';
GRANT ALL PRIVILEGES ON reviewloop.* TO 'reviewloop_user'@'localhost';
FLUSH PRIVILEGES;
SELECT 'Database and user created successfully!' AS Status;
EOF

    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Database setup complete!"
        echo ""
        echo "📝 Update your .env file with these credentials:"
        echo "   DB_HOST=localhost"
        echo "   DB_USER=reviewloop_user"
        echo "   DB_PASSWORD=reviewloop_password"
        echo "   DB_NAME=reviewloop"
    fi
fi
