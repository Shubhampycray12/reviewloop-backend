#!/bin/bash

# Fix MySQL Database Setup for ReviewLoop

echo "🔧 Setting up MySQL database for ReviewLoop..."

# Try to access MySQL with sudo (common on Ubuntu)
echo "Attempting to create database and user..."

sudo mysql <<EOF
-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS reviewloop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user if it doesn't exist
CREATE USER IF NOT EXISTS 'root'@'localhost' IDENTIFIED BY 'secret';

-- Alternative: Create a dedicated user (recommended)
CREATE USER IF NOT EXISTS 'reviewloop_user'@'localhost' IDENTIFIED BY 'secret';

-- Grant privileges
GRANT ALL PRIVILEGES ON reviewloop.* TO 'root'@'localhost';
GRANT ALL PRIVILEGES ON reviewloop.* TO 'reviewloop_user'@'localhost';

-- Flush privileges
FLUSH PRIVILEGES;

SELECT 'Database setup complete!' AS Status;
SHOW DATABASES LIKE 'reviewloop';
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database setup successful!"
    echo ""
    echo "The database 'reviewloop' has been created."
    echo "You can now use either:"
    echo "  - DB_USER=root with DB_PASSWORD=secret"
    echo "  - DB_USER=reviewloop_user with DB_PASSWORD=secret"
    echo ""
    echo "Your current .env should work now. Try running 'npm run dev' again."
else
    echo ""
    echo "❌ Setup failed. Trying alternative method..."
    echo ""
    echo "If the above didn't work, you may need to:"
    echo "1. Set MySQL root password manually:"
    echo "   sudo mysql"
    echo "   ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'secret';"
    echo "   FLUSH PRIVILEGES;"
    echo ""
    echo "2. Or update your .env file to use a different user/password"
fi
