# Zero Hunger Connect - Deployment Guide

## Overview

This guide provides instructions for deploying the Zero Hunger Connect application to production environments.

---

## Prerequisites

### Development Environment
- Node.js 18.x or higher
- npm or pnpm package manager
- Git

### Production Requirements
- Domain name
- SSL certificate (provided by hosting platforms)
- Database service (PostgreSQL or MongoDB)
- Cloud hosting platform account

---

## Environment Variables

Create a `.env` file in the project root:

```bash
# App Configuration
NODE_ENV=production
VITE_APP_NAME="Zero Hunger Connect"
VITE_APP_URL=https://yourapp.com

# Backend API (if separate)
VITE_API_URL=https://api.yourapp.com
VITE_API_KEY=your_api_key_here

# Database (Backend)
DATABASE_URL=postgresql://user:password@host:5432/database
# or for MongoDB
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/database

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Supabase (if using)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Google Maps API (for production maps)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Email Service (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# SMS Service (optional)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# File Storage (optional)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=your_bucket_name
AWS_REGION=us-east-1

# Analytics (optional)
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
```

---

## Deployment Options

### Option 1: Vercel (Recommended for Frontend)

#### Steps:

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Configure Project Settings**
   - Go to Vercel Dashboard
   - Select your project
   - Add environment variables
   - Configure build settings:
     - Build Command: `npm run build`
     - Output Directory: `dist`
     - Install Command: `npm install`

#### Automatic Deployments

Connect your GitHub repository:
1. Go to Vercel Dashboard
2. Import Git Repository
3. Select your repository
4. Configure settings
5. Deploy

Every push to main branch will trigger automatic deployment.

---

### Option 2: Netlify

#### Steps:

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize and Deploy**
   ```bash
   netlify init
   netlify deploy --prod
   ```

4. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Add environment variables in Netlify dashboard

#### netlify.toml Configuration

Create `netlify.toml` in project root:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

---

### Option 3: AWS Amplify

#### Steps:

1. **Install AWS Amplify CLI**
   ```bash
   npm install -g @aws-amplify/cli
   ```

2. **Initialize Amplify**
   ```bash
   amplify init
   ```

3. **Configure Build Settings**
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: dist
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

4. **Deploy**
   ```bash
   amplify publish
   ```

---

### Option 4: Docker Deployment

#### Dockerfile

Create `Dockerfile`:

```dockerfile
# Build stage
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### nginx.conf

Create `nginx.conf`:

```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Build and Run

```bash
# Build image
docker build -t zero-hunger-connect .

# Run container
docker run -d -p 80:80 zero-hunger-connect

# Or use Docker Compose
docker-compose up -d
```

#### docker-compose.yml

```yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped

  database:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: zerohunger
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

---

## Backend Deployment

### Node.js/Express Backend

#### Deployment to Heroku

1. **Create Heroku App**
   ```bash
   heroku create your-app-name
   ```

2. **Add PostgreSQL**
   ```bash
   heroku addons:create heroku-postgresql:hobby-dev
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your_secret
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

#### Deployment to Railway

1. Connect GitHub repository
2. Configure environment variables
3. Deploy automatically on push

#### Deployment to DigitalOcean App Platform

1. Connect GitHub repository
2. Configure build settings
3. Add environment variables
4. Deploy

---

### Supabase Backend

#### Setup Steps:

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Create new project
   - Note your project URL and anon key

2. **Run Database Migrations**
   ```bash
   supabase db push
   ```

3. **Configure Authentication**
   - Enable email/password auth
   - Configure email templates
   - Set up OAuth providers (optional)

4. **Set Row-Level Security Policies**
   - Apply RLS policies from DATABASE_SCHEMA.md

5. **Deploy Edge Functions** (if using)
   ```bash
   supabase functions deploy function-name
   ```

---

## Database Setup

### PostgreSQL (Supabase/Railway/Heroku)

1. **Create Database**
2. **Run Migrations**
   ```bash
   npm run migrate
   ```
3. **Seed Initial Data**
   ```bash
   npm run seed
   ```

### MongoDB Atlas

1. **Create Cluster**
2. **Configure Network Access**
3. **Create Database User**
4. **Get Connection String**
5. **Update Environment Variables**

---

## Post-Deployment Checklist

### Security

- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable security headers
- [ ] Set strong passwords for all services
- [ ] Configure firewall rules
- [ ] Enable database backups
- [ ] Set up monitoring and alerts

### Performance

- [ ] Enable CDN for static assets
- [ ] Configure caching headers
- [ ] Enable gzip compression
- [ ] Optimize images
- [ ] Minify CSS/JS (handled by Vite)
- [ ] Set up database connection pooling
- [ ] Configure database indexes

### Monitoring

- [ ] Set up error tracking (Sentry)
- [ ] Configure uptime monitoring
- [ ] Enable analytics (Google Analytics)
- [ ] Set up logging (CloudWatch, Papertrail)
- [ ] Configure alerts for critical errors

### Testing

- [ ] Test all user flows
- [ ] Test on multiple devices
- [ ] Test on different browsers
- [ ] Verify all API endpoints
- [ ] Test authentication flows
- [ ] Verify geolocation features
- [ ] Test file uploads (if applicable)

---

## Monitoring and Maintenance

### Error Tracking with Sentry

1. **Install Sentry**
   ```bash
   npm install @sentry/react
   ```

2. **Initialize Sentry**
   ```typescript
   import * as Sentry from "@sentry/react";

   Sentry.init({
     dsn: "your-sentry-dsn",
     environment: process.env.NODE_ENV,
     tracesSampleRate: 1.0,
   });
   ```

### Uptime Monitoring

Use services like:
- UptimeRobot
- Pingdom
- StatusCake
- Better Uptime

### Analytics

```typescript
// Google Analytics 4
import ReactGA from "react-ga4";

ReactGA.initialize("G-XXXXXXXXXX");
ReactGA.send({ hitType: "pageview", page: window.location.pathname });
```

---

## Scaling Considerations

### Frontend

- **CDN**: Use Cloudflare or AWS CloudFront
- **Load Balancing**: Multiple server instances
- **Caching**: Redis for API responses
- **Image Optimization**: Use Cloudinary or Imgix

### Backend

- **Horizontal Scaling**: Add more server instances
- **Database Scaling**: 
  - Read replicas for PostgreSQL
  - Sharding for MongoDB
  - Connection pooling (PgBouncer)
- **Caching Layer**: Redis or Memcached
- **Queue System**: Bull, RabbitMQ for async tasks
- **Microservices**: Split into smaller services if needed

### Database

- **Indexes**: Optimize queries with proper indexes
- **Partitioning**: For very large tables
- **Read Replicas**: Distribute read load
- **Backup Strategy**: Regular automated backups

---

## CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.API_URL }}
          
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## Rollback Strategy

### Vercel/Netlify
- Use dashboard to rollback to previous deployment
- Or redeploy specific commit:
  ```bash
  vercel --prod --force
  ```

### Docker
```bash
# Rollback to previous version
docker pull your-image:previous-version
docker-compose up -d
```

### Database Migrations
- Keep migration rollback scripts
- Test rollbacks in staging first
- Backup database before migrations

---

## Support and Maintenance

### Regular Tasks

**Daily:**
- Monitor error logs
- Check uptime status
- Review user feedback

**Weekly:**
- Review performance metrics
- Check database size
- Update dependencies

**Monthly:**
- Security updates
- Performance optimization
- Backup verification
- Cost review

### Emergency Procedures

1. **Service Down:**
   - Check status page
   - Review error logs
   - Contact hosting support
   - Implement rollback if needed

2. **Database Issues:**
   - Check connection limits
   - Review slow queries
   - Verify backups
   - Scale resources if needed

3. **Security Breach:**
   - Immediate lockdown
   - Reset all secrets
   - Notify users
   - Investigate and patch

---

## Cost Optimization

### Hosting
- Start with free tiers (Vercel, Netlify)
- Monitor usage and upgrade as needed
- Use reserved instances for predictable load

### Database
- Start with hobby tier
- Monitor connection usage
- Optimize queries before scaling
- Consider read replicas only when needed

### Third-party Services
- Use free tiers where possible
- Monitor API usage
- Set up billing alerts
- Remove unused services

---

## Resources

- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [React Router Deployment](https://reactrouter.com/en/main/guides/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [Docker Documentation](https://docs.docker.com/)
