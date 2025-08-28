# Architecture Documentation

## Overview
The `n8n-nodes-cloudflare-vectorize` package provides a comprehensive n8n community node for integrating with Cloudflare Vectorize, a vector database service for semantic search and RAG (Retrieval-Augmented Generation) applications.

## Design Principles
- **Consistency**: Following the same architectural patterns as the successful D1 node
- **AI-First**: Designed to work seamlessly as AI Agent tools with descriptive metadata
- **Type Safety**: Comprehensive TypeScript types for all operations and data structures
- **Error Resilience**: Robust error handling with informative messages
- **Scalability**: Support for batch operations and efficient API usage

## Project Structure

```
n8n-nodes-cloudflare-vectorize/
├── credentials/
│   └── CloudflareVectorizeApi.credentials.ts    # API credential management
├── nodes/
│   └── CloudflareVectorize/
│       ├── CloudflareVectorize.node.ts          # Main node implementation
│       └── cloudflare-vectorize.svg             # Node icon
├── types/
│   └── CloudflareVectorizeTypes.ts              # TypeScript type definitions
├── utils/
│   └── CloudflareVectorizeUtils.ts              # API utility functions
├── dist/                                        # Compiled output (generated)
├── package.json                                 # Package configuration
├── tsconfig.json                                # TypeScript configuration
├── gulpfile.js                                  # Build configuration
└── index.js                                     # Entry point
```

## Core Components

### 1. Credentials (`CloudflareVectorizeApi.credentials.ts`)
Manages secure storage of:
- Cloudflare Account ID
- API Token with appropriate permissions
- API Endpoint (defaults to Cloudflare's API)

### 2. Types (`CloudflareVectorizeTypes.ts`)
Comprehensive type definitions for:
- Vector operations and data structures
- Index configuration and metadata
- API request/response formats
- Error handling types
- Namespace and filtering types

### 3. Utilities (`CloudflareVectorizeUtils.ts`)
Core utility class providing:
- HTTP request handling to Cloudflare API
- Error parsing and standardization
- Response data transformation
- Retry logic and rate limiting
- Batch operation optimization

### 4. Main Node (`CloudflareVectorize.node.ts`)
Primary node implementation featuring:
- Resource-based operation organization
- Dynamic UI based on selected operations
- AI-friendly descriptions and metadata
- Comprehensive input validation
- Error handling and user feedback

## Resource Organization

The node organizes operations into logical resources:

### Index Resource
- **create**: Create new vector indexes
- **list**: List all available indexes
- **delete**: Remove indexes
- **get**: Get index details
- **info**: Get index information and statistics

### Vector Resource
- **insert**: Add new vectors (fails if ID exists)
- **upsert**: Add or update vectors
- **query**: Search vectors by similarity
- **queryById**: Search using existing vector as query
- **getByIds**: Retrieve specific vectors
- **deleteByIds**: Remove specific vectors

### Metadata Resource
- **createIndex**: Create metadata indexes for filtering
- **deleteIndex**: Remove metadata indexes
- **listIndexes**: List available metadata indexes

### Utility Resource
- **listVectors**: List all vector IDs in an index
- **describe**: Get detailed index configuration

## AI Agent Integration

### Tool Compatibility
- `usableAsTool: true` enables AI Agent usage
- Descriptive operation and parameter descriptions
- Clear examples in parameter help text
- Error messages designed for AI interpretation

### Operation Descriptions
Each operation includes:
- Clear purpose statement
- Usage context and examples
- Parameter descriptions with type information
- Expected output format

## Data Flow

### API Communication
1. User configures credentials in n8n
2. Node receives input data from workflow
3. Parameters are validated and transformed
4. API request is constructed using utilities
5. Cloudflare Vectorize API is called
6. Response is parsed and formatted
7. Results are passed to next workflow node

### Error Handling
1. Network errors are caught and retried
2. API errors are parsed and contextualized
3. User-friendly error messages are provided
4. Errors include actionable guidance

## Performance Considerations

### Batch Operations
- Support for multiple vectors per operation
- Optimal batch sizing for API limits
- Efficient memory usage for large datasets

### API Efficiency
- Request deduplication where possible
- Appropriate HTTP methods and headers
- Connection reuse and keepalive

### Rate Limiting
- Built-in retry logic with exponential backoff
- Respect for Cloudflare API rate limits
- Graceful degradation under load

## Security

### Credential Management
- API tokens stored encrypted in n8n database
- No credentials logged or exposed in errors
- Secure transmission to Cloudflare APIs

### Data Handling
- Vector data processed in memory only
- No persistent storage of user data
- Metadata sanitized before API calls

## Extension Points

### Future Enhancements
- Custom distance metrics support
- Advanced metadata filtering
- Vector visualization tools
- Performance monitoring
- Custom embedding model integration

### Community Contributions
- Clear interfaces for extending operations
- Modular utility functions
- Comprehensive type definitions
- Documentation for contributors