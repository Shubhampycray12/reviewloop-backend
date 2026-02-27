#!/bin/bash

# Set MySQL root password to Test@123

echo "🔐 Setting MySQL root password to Test@123..."

sudo mysql <<EOF
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Test@123';
CREATE DATABASE IF NOT EXISTS reviewloop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON reviewloop.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
SELECT 'Password set successfully!' AS Status;
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ MySQL root password has been set to 'Test@123'"
    echo "✅ Database 'reviewloop' has been created"
    echo ""
    echo "Your .env file has been updated. You can now run 'npm run dev'"
else
    echo ""
    echo "❌ Failed to set password. Please check MySQL installation."
fi
