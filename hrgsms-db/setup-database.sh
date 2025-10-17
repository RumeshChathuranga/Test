#!/bin/bash

# HRGSMS Database Setup Script

echo "🗄️  Setting up HRGSMS Database"
echo "================================"

# Check if MySQL is running
echo "Checking MySQL service..."
if ! systemctl is-active --quiet mysql 2>/dev/null && ! systemctl is-active --quiet mysqld 2>/dev/null; then
    echo "⚠️  MySQL service is not running. Please start MySQL first:"
    echo "   sudo systemctl start mysql"
    echo "   or"
    echo "   sudo systemctl start mysqld"
    exit 1
fi

echo "✅ MySQL service is running"

# Database configuration from backend .env
DB_HOST="localhost"
DB_PORT="3306"
DB_USER="root"
DB_PASSWORD="Ruma@1220"
DB_NAME="hrgsms_db"

echo ""
echo "Database Configuration:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  User: $DB_USER"
echo "  Database: $DB_NAME"
echo ""

# Create database
echo "📊 Creating database '$DB_NAME'..."
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Database '$DB_NAME' created successfully"
else
    echo "❌ Failed to create database. Please check your MySQL credentials."
    exit 1
fi

# Import schema
echo "📋 Importing database schema..."
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < schema_fixed.sql

if [ $? -eq 0 ]; then
    echo "✅ Schema imported successfully"
else
    echo "❌ Failed to import schema"
    exit 1
fi

# Import functions
echo "⚙️  Importing functions..."
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < functions.sql

if [ $? -eq 0 ]; then
    echo "✅ Functions imported successfully"
else
    echo "⚠️  Warning: Some functions may have failed to import"
fi

# Import procedures
echo "📝 Importing procedures..."
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < procedures.sql

if [ $? -eq 0 ]; then
    echo "✅ Procedures imported successfully"
else
    echo "⚠️  Warning: Some procedures may have failed to import"
fi

# Import triggers
echo "🔄 Importing triggers..."
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < triggers.sql

if [ $? -eq 0 ]; then
    echo "✅ Triggers imported successfully"
else
    echo "⚠️  Warning: Some triggers may have failed to import"
fi

# Import seed data
echo "🌱 Importing seed data..."
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < seed_data_fixed.sql

if [ $? -eq 0 ]; then
    echo "✅ Seed data imported successfully"
else
    echo "⚠️  Warning: Some seed data may have failed to import"
fi

echo ""
echo "🎉 Database setup completed!"
echo "================================"
echo ""
echo "✅ Database '$DB_NAME' is ready to use"
echo "🔗 You can now start the backend and frontend services"
echo ""
echo "To start the services:"
echo "  cd .. && ./start-all.sh"
echo ""