# Deployment Guide

This guide covers multiple deployment options for your pricing application.

## 🚀 Quick Start (Docker)

### Prerequisites
- Docker and Docker Compose installed
- Your Peach Wireless credentials

### Steps
1. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your actual credentials
   ```

2. **Deploy with Docker:**
   ```bash
   ./deploy.sh
   ```

3. **Access your applications:**
   - Backend API: http://localhost:3001
   - Admin Dashboard: http://localhost:3000
   - Client Portal: http://localhost:4000

## 🌐 Cloud Deployment Options

### Option 1: Vercel (Frontend) + Railway (Backend)

#### Frontend Deployment (Vercel)
1. Install Vercel CLI: `npm i -g vercel`
2. Deploy admin dashboard:
   ```bash
   cd client
   vercel --prod
   ```
3. Deploy client portal:
   ```bash
   cd client-portal
   vercel --prod
   ```

#### Backend Deployment (Railway)
1. Create account at [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Set environment variables in Railway dashboard
4. Deploy automatically

### Option 2: DigitalOcean App Platform

1. Create account at [digitalocean.com](https://digitalocean.com)
2. Create new app from GitHub repository
3. Configure build settings:
   - Build command: `npm install && npm run build`
   - Run command: `node server.js`
4. Set environment variables
5. Deploy

### Option 3: AWS EC2

1. Launch EC2 instance (Ubuntu recommended)
2. Install Docker:
   ```bash
   sudo apt update
   sudo apt install docker.io docker-compose
   ```
3. Clone repository and deploy:
   ```bash
   git clone <your-repo>
   cd <your-repo>
   ./deploy.sh
   ```

### Option 4: Google Cloud Run

1. Install Google Cloud CLI
2. Build and deploy:
   ```bash
   gcloud builds submit --tag gcr.io/PROJECT_ID/pricing-app
   gcloud run deploy pricing-app --image gcr.io/PROJECT_ID/pricing-app
   ```

## 🔧 Environment Variables

Create a `.env` file with:

```env
NODE_ENV=production
PORT=3001
PEACH_USER=your_email@example.com
PEACH_PASS=your_password
JWT_SECRET=your_jwt_secret_here
REACT_APP_API_URL=https://your-backend-domain.com
```

## 📊 Monitoring & Logs

### Docker Compose
```bash
# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend

# Restart services
docker-compose restart
```

### Production Monitoring
- Set up health checks at `/api/health`
- Monitor database size and performance
- Set up alerts for scraper failures

## 🔒 Security Considerations

1. **Environment Variables:** Never commit credentials to Git
2. **HTTPS:** Always use HTTPS in production
3. **Database:** Consider using PostgreSQL for production
4. **Rate Limiting:** Implement API rate limiting
5. **CORS:** Configure CORS properly for your domains

## 🚨 Troubleshooting

### Common Issues

1. **Port conflicts:**
   ```bash
   # Check what's using the port
   lsof -i :3001
   ```

2. **Database issues:**
   ```bash
   # Reset database
   rm database.sqlite
   docker-compose restart backend
   ```

3. **Build failures:**
   ```bash
   # Clear node modules and rebuild
   rm -rf node_modules package-lock.json
   npm install
   ```

### Logs Location
- Docker logs: `docker-compose logs`
- Application logs: Check your deployment platform's logging system

## 📈 Scaling Considerations

1. **Database:** Consider migrating to PostgreSQL for better performance
2. **Caching:** Implement Redis for session storage
3. **CDN:** Use CloudFlare or similar for static assets
4. **Load Balancing:** Use multiple instances behind a load balancer

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to production
        run: |
          # Your deployment commands
```

## 📞 Support

For deployment issues:
1. Check the logs: `docker-compose logs`
2. Verify environment variables are set correctly
3. Ensure all required ports are open
4. Test the scraper credentials manually

## 🎯 Next Steps

1. Set up a domain name
2. Configure SSL certificates
3. Set up monitoring and alerts
4. Implement backup strategies
5. Plan for database migration to PostgreSQL 