# Claude Development Instructions

## Project Context

This is the **n8n-nodes-cloudflare-vectorize** package - a comprehensive n8n community node for Cloudflare Vectorize integration.

### Key Information
- **Author**: Jez (Jeremy Dawes) - jeremy@jezweb.net
- **Purpose**: n8n community node for vector database operations
- **Target**: Both workflow nodes and AI Agent tools
- **Pattern**: Following successful D1 node architecture

## Development Guidelines

### Code Style & Conventions

1. **TypeScript First**: All code must be strongly typed
2. **Error Handling**: Comprehensive error handling with user-friendly messages
3. **AI Descriptions**: All operations must have clear, AI-readable descriptions
4. **Consistency**: Follow D1 node patterns exactly
5. **Documentation**: Update all documentation files when making changes

### File Structure Rules

- **credentials/**: API credential definitions only
- **types/**: All TypeScript interfaces and types
- **utils/**: Utility classes and helper functions
- **nodes/**: Node implementations and icons
- **Root files**: Configuration, documentation, and build files

### Key Implementation Requirements

1. **usableAsTool: true**: Must be set for AI Agent compatibility
2. **Descriptive properties**: All parameters need clear descriptions with examples
3. **Resource organization**: Use resource → operation → parameters structure
4. **Batch support**: Support both single and batch operations where applicable
5. **Namespace support**: Include namespace parameters throughout

### API Integration

- **Base URL**: `https://api.cloudflare.com/client/v4`
- **Authentication**: Bearer token in Authorization header
- **Endpoints**: Use v2 Vectorize API endpoints
- **Error handling**: Parse Cloudflare error responses properly
- **Rate limiting**: Implement retry with exponential backoff

### Documentation Requirements

When making changes, update these files:
- **SCRATCHPAD.md**: Development progress and notes
- **ARCHITECTURE.md**: Technical architecture details
- **README.md**: User-facing documentation and examples
- **CHANGELOG.md**: Version history and changes
- **DEPLOYMENT.md**: Publishing and deployment procedures

### Testing Strategy

1. **Local testing**: Test with linked package in local n8n
2. **Credential validation**: Test authentication with real API tokens
3. **Error scenarios**: Test error handling and edge cases
4. **AI Agent testing**: Verify tool compatibility
5. **Batch operations**: Test large vector operations

### Git Workflow

- **Commit frequency**: Commit at logical intervals
- **Message format**: Clear, descriptive commit messages
- **Branch strategy**: Work on main branch for simplicity
- **Tags**: Tag releases with version numbers

## Current State

### Completed
✅ Project structure and configuration
✅ Documentation framework
✅ Build system setup

### In Progress
🔄 Core implementation (credentials, types, utils, node)

### TODO
⏳ Testing and validation
⏳ Git repository setup
⏳ Final documentation updates

## AI Agent Integration Notes

This node is designed to work seamlessly with n8n AI Agents:

### Tool Descriptions
- Use natural language that AI models can understand
- Include context about when to use each operation
- Provide examples in parameter descriptions
- Avoid technical jargon in user-facing descriptions

### Parameter Design
- Make parameters as self-explanatory as possible
- Use reasonable defaults where applicable
- Include validation that provides helpful error messages
- Support both direct values and n8n expressions

### Error Messages
- Write errors that help AI agents understand what went wrong
- Include suggestions for resolution
- Avoid exposing internal technical details
- Format errors consistently

## Vectorize-Specific Notes

### Operations Mapping
- **Index operations**: create, list, delete, get, info
- **Vector operations**: insert, upsert, query, queryById, getByIds, deleteByIds
- **Metadata operations**: createIndex, deleteIndex, listIndexes
- **Utility operations**: listVectors, describe

### Key Concepts
- **Dimensions**: Must match between index and vectors
- **Metrics**: cosine, euclidean, dot-product
- **Namespaces**: Up to 64 characters, optional segmentation
- **Metadata**: Key-value pairs, requires indexes for filtering
- **Mutation IDs**: Async operations return mutation identifiers

### API Limits
- 1,000 vectors per insert/upsert
- 100 topK for queries (20 with full data)
- 10 metadata indexes per index
- 1536 max dimensions
- 10KB max metadata per vector

## Support & Maintenance

### Community Engagement
- Monitor GitHub issues regularly
- Participate in n8n community discussions
- Provide helpful documentation and examples
- Respond to user questions promptly

### Version Management
- Follow semantic versioning
- Document breaking changes clearly
- Provide migration guides when needed
- Test thoroughly before releasing

Remember: This node represents Jezweb in the n8n community, so maintain high quality and helpful support.