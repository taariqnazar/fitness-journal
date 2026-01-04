#!/bin/sh
# 1. Initialize or update the database schema
npx prisma db push

# 2. Start the application
node server.js
