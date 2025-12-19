# Deployment Guide

This guide covers deploying Cloudflare Workers from the monorepo template.

## Prerequisites

Before deploying, ensure you have:

- Cloudflare account (free tier available)
- Node.js 20+ LTS installed
- PNPM 8.14+ installed
- Wrangler CLI 3.22+ (installed via dev dependencies)

## Quick Deploy

Deploy all workers with a single command:

```bash
pnpm deploy
```

Deploy a specific worker:

```bash
pnpm --filter @repo/example-worker deploy
```

## Initial Setup

### 1. Create Cloudflare Account

1. Visit [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Sign up for a free account
3. Verify your email address

### 2. Get Your Account ID

1. Go to [Workers & Pages](https://dash.cloudflare.com/?to=/:account/workers)
2. Copy your Account ID from the right sidebar
3. Save it for the next step

### 3. Authenticate Wrangler

**Option A: Interactive Login (Recommended)**

```bash
npx wrangler login
```

This opens a browser window to authorize Wrangler.

**Option B: API Token**

1. Go to [API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click "Create Token"
3. Use the "Edit Cloudflare Workers" template
4. Set the token as an environment variable:

```bash
export CLOUDFLARE_API_TOKEN=your_token_here
```

### 4. Configure Workers

This template uses `@repo/wrangler-config` for type-safe configuration. Update `wrangler.config.ts` in each worker directory:

```typescript
import { defineConfig, d1Binding } from '@repo/wrangler-config';

export default defineConfig({
  name: 'example-worker',
  main: 'src/index.ts',
  compatibility_date: '2024-01-01',
  account_id: 'your_account_id_here', // Add your account ID
  bindings: [
    d1Binding('DB', 'example-db', 'db-id-dev'),
  ],
  environments: {
    production: {
      name: 'example-worker-prod',
      bindings: [
        d1Binding('DB', 'example-db-prod', 'db-id-prod'),
      ],
    },
  },
});
```

Then generate `wrangler.toml`:

```bash
pnpm --filter @repo/example-worker config:generate
```

**Benefits**:
- Type-safe configuration with autocomplete
- Centralized binding definitions
- Environment-specific overrides
- Validation before generation

### 5. Set Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Update with your values:

```bash
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token  # If using API token
```

## Deploying Workers

### Deploy to Development

Deploy to the default environment (development):

```bash
# Generate configuration files (if not already generated)
pnpm --filter @repo/example-worker config:generate

# Deploy all workers
pnpm deploy

# Deploy specific worker
pnpm --filter @repo/example-worker deploy
```

**Note**: The `config:generate` task runs automatically before `dev`, `build`, and `deploy` tasks via Turborepo dependencies.

### Deploy to Production

Deploy to production environment:

```bash
# Deploy all workers to production
pnpm deploy:prod

# Deploy specific worker to production
pnpm --filter @repo/example-worker wrangler deploy --env production
```

### Deploy from CI/CD

The template includes GitHub Actions workflows for automated deployment.

**Setup**:

1. Add secrets to your GitHub repository:
   - `CLOUDFLARE_API_TOKEN` - Your Cloudflare API token
   - `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID

2. Update `.github/workflows/ci.yml` to include deployment:

```yaml
- name: Deploy
  if: github.ref == 'refs/heads/main'
  run: pnpm deploy
  env:
    CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

## Database Deployment

### Cloudflare D1

**Create D1 Database**:

```bash
# Navigate to worker directory
cd apps/example-worker

# Create database
npx wrangler d1 create example-db

# Copy the database ID from output
```

**Update `wrangler.toml`**:

```toml
[[d1_databases]]
binding = "DB"
database_name = "example-db"
database_id = "your_database_id_here"

[env.production.d1_databases]
binding = "DB"
database_name = "example-db-prod"
database_id = "your_production_database_id_here"
```

**Run Migrations**:

```bash
# Generate migrations
pnpm --filter @repo/db db:generate

# Apply to D1
cd apps/example-worker
npx wrangler d1 execute example-db --local --file=../../packages/db/migrations/0000_initial.sql

# Apply to production
npx wrangler d1 execute example-db --file=../../packages/db/migrations/0000_initial.sql
```

### PostgreSQL (for non-Workers environments)

**Using Vercel Postgres**:

1. Create database at [Vercel Storage](https://vercel.com/storage/postgres)
2. Copy connection string
3. Set environment variable:

```bash
export POSTGRES_URL="postgresql://user:password@host:5432/database"
```

4. Run migrations:

```bash
pnpm --filter @repo/db db:push:postgres
```

## Environment Management

### Local Development

```bash
# Uses wrangler.toml defaults
pnpm dev
```

### Staging/Preview

```bash
# Deploy to staging environment
pnpm --filter @repo/example-worker wrangler deploy --env staging
```

### Production

```bash
# Deploy to production environment
pnpm --filter @repo/example-worker wrangler deploy --env production
```

## Secrets Management

Sensitive values should be stored as Wrangler secrets, not environment variables.

**Add Secret**:

```bash
# Development
npx wrangler secret put API_KEY

# Production
npx wrangler secret put API_KEY --env production
```

**List Secrets**:

```bash
npx wrangler secret list
```

**Delete Secret**:

```bash
npx wrangler secret delete API_KEY
```

**Access in Worker**:

```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const apiKey = env.API_KEY;
    // Use apiKey
  },
};
```

## KV Namespace Setup

**Create KV Namespace**:

```bash
# Development
npx wrangler kv:namespace create CACHE

# Production
npx wrangler kv:namespace create CACHE --env production
```

**Update `wrangler.toml`**:

```toml
[[kv_namespaces]]
binding = "CACHE"
id = "your_kv_namespace_id"

[env.production.kv_namespaces]
binding = "CACHE"
id = "your_production_kv_namespace_id"
```

## R2 Bucket Setup

**Create R2 Bucket**:

```bash
npx wrangler r2 bucket create my-bucket
```

**Update `wrangler.toml`**:

```toml
[[r2_buckets]]
binding = "STORAGE"
bucket_name = "my-bucket"

[env.production.r2_buckets]
binding = "STORAGE"
bucket_name = "my-bucket-prod"
```

## Custom Domains

**Add Custom Domain**:

1. Go to [Workers & Pages](https://dash.cloudflare.com/?to=/:account/workers)
2. Select your worker
3. Go to "Settings" → "Triggers"
4. Click "Add Custom Domain"
5. Enter your domain (e.g., `api.example.com`)

**DNS Configuration**:

Cloudflare automatically creates DNS records for custom domains on zones managed by Cloudflare.

For external DNS:
1. Create CNAME record pointing to your worker's `workers.dev` URL
2. Verify ownership in Cloudflare dashboard

## Monitoring & Logs

### View Logs

**Real-time logs**:

```bash
npx wrangler tail
```

**Production logs**:

```bash
npx wrangler tail --env production
```

### Analytics

View analytics in Cloudflare Dashboard:
1. Go to [Workers & Pages](https://dash.cloudflare.com/?to=/:account/workers)
2. Select your worker
3. View "Analytics" tab for metrics

### Error Tracking

Consider integrating error tracking:

- [Sentry](https://sentry.io/) - Error monitoring
- [Axiom](https://axiom.co/) - Log aggregation
- [Baselime](https://baselime.io/) - Observability

## Performance Optimization

### Bundle Size

Check bundle size:

```bash
npx wrangler deploy --dry-run --outdir=dist
```

Keep bundles under 1MB (soft limit) for best performance.

### Caching

Use Cloudflare Cache API:

```typescript
const cache = caches.default;
const cachedResponse = await cache.match(request);
if (cachedResponse) return cachedResponse;

const response = await fetch(request);
await cache.put(request, response.clone());
return response;
```

### Edge Optimization

- Use `waitUntil()` for non-blocking operations
- Minimize cold start time (< 200ms target)
- Use KV for frequently accessed data
- Use R2 for large files

## Rollback

**Rollback to Previous Version**:

Cloudflare keeps previous versions. Rollback via dashboard:

1. Go to [Workers & Pages](https://dash.cloudflare.com/?to=/:account/workers)
2. Select your worker
3. Go to "Deployments" tab
4. Click "Rollback" on a previous deployment

**Rollback via CLI**:

```bash
# List deployments
npx wrangler deployments list

# Rollback (not yet supported in CLI - use dashboard)
```

## Troubleshooting

### "Authentication error"

```bash
# Re-authenticate
npx wrangler login

# Or set API token
export CLOUDFLARE_API_TOKEN=your_token
```

### "Account ID not found"

Update `wrangler.toml`:

```toml
account_id = "your_account_id_here"
```

### "Module not found" errors

Ensure `node_compat = true` in `wrangler.toml`:

```toml
node_compat = true
```

### "Database not found"

Create D1 database:

```bash
npx wrangler d1 create your-database-name
```

Update `wrangler.toml` with database ID.

### "Build failed"

Run build locally first:

```bash
pnpm build
```

Fix TypeScript errors before deploying.

## Cost Estimates

Cloudflare Workers pricing (as of 2024):

**Free Tier**:
- 100,000 requests/day
- 10ms CPU time per request
- No credit card required

**Paid Plan ($5/month)**:
- 10 million requests included
- 50ms CPU time per request
- Additional requests: $0.50 per million

**D1 (Free Tier)**:
- 5 GB storage
- 5 million read queries/day
- 100,000 write queries/day

**R2 (Free Tier)**:
- 10 GB storage
- 1 million read queries/month
- 1 million write queries/month

## Security Best Practices

1. **Use Secrets**: Store sensitive values as Wrangler secrets
2. **HTTPS Only**: Workers run on HTTPS by default
3. **Rate Limiting**: Implement rate limiting for public APIs
4. **CORS**: Configure CORS headers appropriately
5. **Audit Dependencies**: Run `npm audit` regularly (included in CI)
6. **Update Regularly**: Keep dependencies up to date

## Additional Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/)
- [D1 Documentation](https://developers.cloudflare.com/d1/)
- [R2 Documentation](https://developers.cloudflare.com/r2/)
- [KV Documentation](https://developers.cloudflare.com/workers/runtime-apis/kv/)
- [Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/)

## Support

For deployment issues:

1. Check [Cloudflare Status](https://www.cloudflarestatus.com/)
2. Review [Cloudflare Community](https://community.cloudflare.com/)
3. Open issue in template repository
4. Contact [Cloudflare Support](https://support.cloudflare.com/)
