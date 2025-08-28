# Deployment Guide

## Publishing to npm

### Prerequisites

1. **npm account**: Create account at [npmjs.com](https://www.npmjs.com/)
2. **npm CLI**: Install and login
   ```bash
   npm login
   ```
3. **Repository setup**: GitHub repository with proper configuration
4. **Testing**: Local testing completed successfully

### Pre-deployment Checklist

- [ ] All tests pass locally
- [ ] Documentation is complete and accurate
- [ ] Version number updated in `package.json`
- [ ] `CHANGELOG.md` updated with new version changes
- [ ] Build succeeds without errors
- [ ] Lint passes without issues

### Version Management

Update version using npm semver:

```bash
# Patch version (bug fixes)
npm version patch

# Minor version (new features)
npm version minor

# Major version (breaking changes)
npm version major
```

### Build and Publish

```bash
# Clean build
npm run build

# Lint check
npm run lint

# Publish to npm
npm publish
```

### Post-publication

1. **Verify publication**: Check package on [npmjs.com](https://www.npmjs.com/package/n8n-nodes-cloudflare-vectorize)
2. **Test installation**: Install from npm in clean environment
3. **Update documentation**: Ensure installation instructions are current
4. **Tag release**: Create GitHub release with version tag

## n8n Community Node Listing

### Requirements

The package must include:
- `"keywords": ["n8n-community-node-package"]` in `package.json`
- Proper `n8n` configuration section
- MIT or compatible license
- Comprehensive README
- Working installation from npm

### Automatic Discovery

Once published to npm with correct keywords, the package will automatically appear in n8n's community nodes search.

## Local Development Setup

### For n8n Cloud Users

n8n Cloud doesn't support community nodes, but you can:
1. Use n8n Desktop for local development
2. Self-host n8n with Docker
3. Use n8n's source code setup

### Self-hosted n8n Installation

#### Docker Setup

```bash
# Create directory
mkdir n8n-data
cd n8n-data

# Docker run with community nodes enabled
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -e N8N_COMMUNITY_PACKAGES_ENABLED=true \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

#### Manual Installation

```bash
# Install n8n globally
npm install -g n8n

# Enable community packages
export N8N_COMMUNITY_PACKAGES_ENABLED=true

# Start n8n
n8n start
```

### Local Node Development

#### Link Development Package

```bash
# In your node package directory
npm run build
npm link

# In your n8n custom directory
cd ~/.n8n/custom
npm link n8n-nodes-cloudflare-vectorize

# Restart n8n
```

#### Development Workflow

1. **Make changes**: Edit TypeScript source files
2. **Build**: Run `npm run build`
3. **Test**: Restart n8n and test changes
4. **Iterate**: Repeat until satisfied

#### Debugging

Enable n8n debug logging:

```bash
# Set debug level
export N8N_LOG_LEVEL=debug

# Start n8n
n8n start
```

## Production Deployment

### Environment Configuration

Set up proper environment variables:

```bash
# Enable community packages
N8N_COMMUNITY_PACKAGES_ENABLED=true

# Set log level
N8N_LOG_LEVEL=info

# Database configuration (recommended for production)
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=localhost
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=n8n
DB_POSTGRESDB_USER=n8n_user
DB_POSTGRESDB_PASSWORD=secure_password
```

### Security Considerations

1. **API Tokens**: Use restricted tokens with minimal required permissions
2. **Network**: Secure n8n instance behind proper firewall/proxy
3. **Updates**: Keep n8n and community nodes updated
4. **Monitoring**: Set up logging and monitoring for the installation

### Performance Optimization

1. **Database**: Use PostgreSQL for production instead of SQLite
2. **Resources**: Adequate CPU and memory for vector operations
3. **Caching**: Configure appropriate caching for frequently accessed data
4. **Limits**: Set reasonable limits for batch operations

## Monitoring and Maintenance

### Health Checks

Monitor these aspects:

1. **Node availability**: Ensure node loads properly
2. **API connectivity**: Verify Cloudflare API access
3. **Error rates**: Monitor for common errors
4. **Performance**: Track operation response times

### Updating

#### Node Updates

Users can update through n8n interface:
1. Go to Settings > Community Nodes
2. Find the package
3. Click "Update" if available

#### Breaking Changes

If releasing breaking changes:
1. Follow semantic versioning (major version bump)
2. Document migration path in `CHANGELOG.md`
3. Consider deprecation warnings in previous version

### Support

Provide clear support channels:

1. **GitHub Issues**: Primary support channel
2. **Documentation**: Comprehensive troubleshooting guide
3. **Community**: n8n community forum participation
4. **Direct contact**: Email for urgent issues

## Rollback Procedures

### Package Rollback

If issues discovered after publishing:

```bash
# Unpublish version (within 24 hours)
npm unpublish n8n-nodes-cloudflare-vectorize@problematic-version

# Or deprecate
npm deprecate n8n-nodes-cloudflare-vectorize@problematic-version "Issue found, use previous version"
```

### User Recovery

Guide users to recover from issues:

1. **Uninstall problematic version**:
   - Remove from Community Nodes interface
   - Or manually: `cd ~/.n8n/custom && npm uninstall n8n-nodes-cloudflare-vectorize`

2. **Install working version**:
   - Specify version in Community Nodes interface
   - Or manually: `npm install n8n-nodes-cloudflare-vectorize@working-version`

3. **Restart n8n**: Required after any community node changes