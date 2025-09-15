# Production Deployment Guide

This guide covers deploying the Streaming Proxies application to production with proper configuration and without mock data.

## Environment Configuration

### 1. Environment Variables

Copy `.env.production` to `.env.local` and update with your actual values:

```bash
# Production Environment
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production

# Disable mock data
NEXT_PUBLIC_ENABLE_MOCK_DATA=false

# Real-time updates
NEXT_PUBLIC_ENABLE_REAL_TIME=true

# WebSocket Server (update with your actual server)
NEXT_PUBLIC_WS_URL=wss://your-websocket-server.com/ws

# API Server (update with your actual API server)
NEXT_PUBLIC_API_BASE_URL=https://your-api-server.com/api

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/streaming_proxies

# Authentication
NEXTAUTH_SECRET=your-secure-secret-here
NEXTAUTH_URL=https://your-domain.com

# Optional: Error reporting
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

### 2. Required API Endpoints

Your backend API must implement these endpoints:

#### Streaming Proxies
- `GET /api/streaming-proxies` - List all proxies
- `POST /api/streaming-proxies` - Create new proxy
- `GET /api/streaming-proxies/:id` - Get proxy details
- `PUT /api/streaming-proxies/:id` - Update proxy
- `DELETE /api/streaming-proxies/:id` - Delete proxy

#### Streaming Sessions
- `GET /api/streaming-sessions` - List active sessions
- `POST /api/streaming-sessions` - Start new session
- `POST /api/streaming-sessions/:id/end` - End session

#### System Stats
- `GET /api/system-stats` - Get system statistics
- `GET /api/admin/stats` - Get admin dashboard stats

### 3. WebSocket Server (Optional)

If you want real-time updates, set up a WebSocket server that sends updates in this format:

```typescript
interface RealTimeUpdate {
  type: 'proxy_status' | 'stream_count' | 'health_check' | 'system_stats';
  data: any;
  timestamp: Date;
}
```

Example WebSocket messages:
```json
{
  "type": "proxy_status",
  "data": {
    "id": "proxy-1",
    "status": "active",
    "currentActiveStreams": 3
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## Deployment Steps

### 1. Build the Application

```bash
npm run build
```

### 2. Database Setup

Ensure your PostgreSQL database is set up with the required tables:
- `streaming_proxies`
- `streaming_sessions`
- `users` (if using authentication)

### 3. Deploy to Your Platform

#### Vercel
```bash
vercel --prod
```

#### Docker
```bash
docker build -t streaming-proxies .
docker run -p 3000:3000 --env-file .env.production streaming-proxies
```

#### Traditional Server
```bash
npm run start
```

## Production Features

### 1. Graceful Degradation

The application handles missing services gracefully:

- **No WebSocket Server**: Real-time updates are disabled, but the app works with manual refresh
- **API Errors**: Error boundaries show user-friendly messages with retry options
- **Network Issues**: Automatic retry mechanisms with exponential backoff

### 2. Error Handling

- Comprehensive error boundaries for each dashboard section
- Network error detection and recovery
- User-friendly error messages with actionable recovery steps

### 3. Performance

- Optimized bundle size (mock data removed in production)
- Efficient real-time updates only when WebSocket is available
- Automatic data refresh intervals
- Loading states for better UX

## Monitoring

### 1. Error Reporting

If you set `NEXT_PUBLIC_SENTRY_DSN`, errors will be automatically reported to Sentry.

### 2. Health Checks

The application provides these health check endpoints:
- `/api/health` - Basic health check
- `/api/health/detailed` - Detailed system status

### 3. Logging

All WebSocket connection attempts and API calls are logged to the console. In production, configure proper log aggregation.

## Security Considerations

1. **Environment Variables**: Never commit `.env.production` to version control
2. **API Authentication**: Implement proper authentication for your API endpoints
3. **WebSocket Security**: Use WSS (secure WebSocket) in production
4. **CORS**: Configure CORS properly for your API server
5. **Rate Limiting**: Implement rate limiting on your API endpoints

## Troubleshooting

### WebSocket Connection Issues

If you see WebSocket connection errors:

1. Check that `NEXT_PUBLIC_WS_URL` is correct
2. Ensure your WebSocket server is running and accessible
3. Check firewall/proxy settings
4. Verify SSL certificates for WSS connections

The application will work without WebSocket - it just won't have real-time updates.

### API Connection Issues

If API calls fail:

1. Verify `NEXT_PUBLIC_API_BASE_URL` is correct
2. Check API server is running and accessible
3. Verify CORS configuration
4. Check authentication if required

### Build Issues

If the build fails:

1. Ensure all environment variables are set
2. Check for TypeScript errors
3. Verify all dependencies are installed
4. Clear `.next` folder and rebuild

## Performance Optimization

### 1. CDN Configuration

Configure your CDN to cache static assets:
- Cache `/_next/static/*` for 1 year
- Cache images and fonts appropriately
- Don't cache HTML files

### 2. Database Optimization

- Add proper indexes on frequently queried columns
- Implement connection pooling
- Consider read replicas for heavy read workloads

### 3. Monitoring

Set up monitoring for:
- API response times
- WebSocket connection health
- Database performance
- Error rates
- User experience metrics

## Scaling

### Horizontal Scaling

The application is stateless and can be horizontally scaled:

1. Deploy multiple instances behind a load balancer
2. Use sticky sessions if needed for WebSocket connections
3. Ensure database can handle increased load

### WebSocket Scaling

For WebSocket scaling:

1. Use a message broker (Redis, RabbitMQ) for pub/sub
2. Implement WebSocket clustering
3. Consider using a dedicated WebSocket service

## Backup and Recovery

1. **Database Backups**: Regular automated backups of your PostgreSQL database
2. **Configuration Backups**: Backup environment configurations
3. **Disaster Recovery**: Document recovery procedures
4. **Testing**: Regularly test backup restoration

## Support

For production issues:

1. Check application logs
2. Verify all services are running
3. Check network connectivity
4. Review error reporting dashboard
5. Monitor system resources

The application is designed to be resilient and will continue operating even if some services are unavailable.