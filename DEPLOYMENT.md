# Deployment Guide for Hostinger VPS

This guide explains how to host the Decagon project on a Hostinger VPS (Ubuntu) using Nginx and PM2.

## Prerequisites

1.  **Hostinger VPS**: Log in to your Hostinger VPS via SSH.
2.  **Node.js**: Install Node.js (Version 18 or higher recommended).
3.  **MongoDB**: Ensure you have a MongoDB instance (e.g., MongoDB Atlas) and the connection string.

## Step 1: Clone and Prepare

1.  Clone your project to the VPS:
    ```bash
    git clone <your-repo-url> /var/www/decagon
    cd /var/www/decagon
    ```
2.  Install dependencies:
    ```bash
    npm run install:all
    ```

## Step 2: Configure Environment Variables

1.  **Server**:
    ```bash
    cd server
    cp .env.example .env
    nano .env
    ```
    - Set `PORT=5000`
    - Set `MONGO_URI` to your production database.
    - Set `JWT_SECRET` to a strong random string.
    - Set `CLIENT_URL` to your domain or VPS IP.

2.  **Client**:
    ```bash
    cd ../client
    cp .env.example .env
    nano .env
    ```
    - Set `VITE_API_URL=http://your-vps-ip:5000/api` (or your domain).

## Step 3: Build the Frontend

```bash
cd /var/www/decagon/client
npm run build
```
This will create a `dist` folder.

## Step 4: Setup Process Manager (PM2)

1.  Install PM2 globally:
    ```bash
    npm install -g pm2
    ```
2.  Start the server:
    ```bash
    cd /var/www/decagon/server
    pm2 start ecosystem.config.cjs --env production
    ```
3.  Ensure PM2 starts on boot:
    ```bash
    pm2 startup
    pm2 save
    ```

## Step 5: Configure Nginx

1.  Install Nginx:
    ```bash
    sudo apt update
    sudo apt install nginx
    ```
2.  Create a configuration file:
    ```bash
    sudo nano /etc/nginx/sites-available/decagon
    ```
    - Paste the content from the `nginx.conf` file in the project root.
    - Replace `your_domain_or_ip` with your actual VPS IP or domain.
3.  Enable the configuration:
    ```bash
    sudo ln -s /etc/nginx/sites-available/decagon /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl restart nginx
    ```

## Step 6: Security (Firewall)

Allow traffic to HTTP (80) and SSH (22):
```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

---
**Your app should now be live!**
Check the health status at: `http://your-vps-ip/api/health`
