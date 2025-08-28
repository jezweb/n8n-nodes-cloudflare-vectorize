import { IDataObject } from 'n8n-workflow';

// Core operation types
export type VectorizeOperation = 
	// Index operations
	| 'create' 
	| 'list' 
	| 'delete' 
	| 'get' 
	| 'info'
	// Vector operations  
	| 'insert'
	| 'upsert'
	| 'query'
	| 'queryById'
	| 'getByIds'
	| 'deleteByIds'
	// Metadata operations
	| 'createIndex'
	| 'deleteIndex'
	| 'listIndexes'
	// Utility operations
	| 'listVectors'
	| 'describe';

export type VectorizeResource = 'index' | 'vector' | 'metadata' | 'utility';

// Distance metrics supported by Vectorize
export type VectorizeDistanceMetric = 'cosine' | 'euclidean' | 'dot-product';

// Metadata types for indexes
export type VectorizeMetadataType = 'string' | 'number' | 'boolean';

// Vector data structures
export interface VectorizeVector {
	id: string;
	values: number[] | Float32Array | Float64Array;
	metadata?: IDataObject;
	namespace?: string;
}

export interface VectorizeQueryVector {
	values: number[] | Float32Array | Float64Array;
	topK?: number;
	returnValues?: boolean;
	returnMetadata?: 'none' | 'indexed' | 'all';
	filter?: IDataObject;
	namespace?: string;
}

export interface VectorizeQueryMatch {
	id: string;
	score: number;
	values?: number[];
	metadata?: IDataObject;
}

export interface VectorizeQueryResult {
	count: number;
	matches: VectorizeQueryMatch[];
}

// Index configuration
export interface VectorizeIndexConfig {
	dimensions: number;
	metric: VectorizeDistanceMetric;
}

export interface VectorizeIndex {
	name: string;
	description?: string;
	config: VectorizeIndexConfig;
	created_on: string;
	modified_on: string;
}

export interface VectorizeIndexInfo {
	dimensions: number;
	vectorCount: number;
	processedUpToMutation: string;
	processedUpToDatetime: string;
}

// Metadata index structures
export interface VectorizeMetadataIndex {
	propertyName: string;
	type: VectorizeMetadataType;
}

// API request/response types
export interface VectorizeConnectionConfig {
	accountId: string;
	apiToken: string;
	apiEndpoint: string;
}

export interface VectorizeApiResponse<T = any> {
	success: boolean;
	result: T;
	errors: VectorizeApiError[];
	messages: string[];
}

export interface VectorizeApiError {
	code: number;
	message: string;
	details?: IDataObject;
}

// Operation-specific request types
export interface VectorizeCreateIndexRequest extends IDataObject {
	name: string;
	description?: string;
	config: VectorizeIndexConfig;
}

export interface VectorizeInsertRequest extends IDataObject {
	vectors: VectorizeVector[];
}

export interface VectorizeUpsertRequest extends IDataObject {
	vectors: VectorizeVector[];
}

export interface VectorizeQueryRequest extends IDataObject {
	vector: number[] | Float32Array | Float64Array;
	topK?: number;
	returnValues?: boolean;
	returnMetadata?: 'none' | 'indexed' | 'all';
	filter?: IDataObject;
	namespace?: string;
}

export interface VectorizeQueryByIdRequest extends IDataObject {
	id: string;
	topK?: number;
	returnValues?: boolean;
	returnMetadata?: 'none' | 'indexed' | 'all';
	filter?: IDataObject;
	namespace?: string;
}

export interface VectorizeGetByIdsRequest extends IDataObject {
	ids: string[];
}

export interface VectorizeDeleteByIdsRequest extends IDataObject {
	ids: string[];
}

export interface VectorizeCreateMetadataIndexRequest extends IDataObject {
	propertyName: string;
	type: VectorizeMetadataType;
}

export interface VectorizeDeleteMetadataIndexRequest extends IDataObject {
	propertyName: string;
}

export interface VectorizeListVectorsRequest extends IDataObject {
	cursor?: string;
	limit?: number;
}

// Operation-specific response types
export interface VectorizeMutationResponse {
	mutationId: string;
}

export interface VectorizeListIndexesResponse {
	indexes: VectorizeIndex[];
}

export interface VectorizeListVectorsResponse {
	count: number;
	vectors: string[];
	cursor?: string;
	isTruncated: boolean;
	totalCount: number;
	cursorExpirationTimestamp?: string;
}

export interface VectorizeGetByIdsResponse {
	vectors: VectorizeVector[];
}

export interface VectorizeListMetadataIndexesResponse {
	metadataIndexes: VectorizeMetadataIndex[];
}

// Utility types for node parameters
export interface VectorizeNodeParameters extends IDataObject {
	resource: VectorizeResource;
	operation: VectorizeOperation;
	indexName?: string;
	
	// Index operations
	description?: string;
	dimensions?: number;
	metric?: VectorizeDistanceMetric;
	
	// Vector operations
	vectors?: VectorizeVector[];
	vector?: number[];
	queryVector?: number[];
	vectorId?: string;
	vectorIds?: string[];
	topK?: number;
	returnValues?: boolean;
	returnMetadata?: 'none' | 'indexed' | 'all';
	filter?: IDataObject;
	namespace?: string;
	
	// Metadata operations
	propertyName?: string;
	metadataType?: VectorizeMetadataType;
	
	// Utility operations
	cursor?: string;
	limit?: number;
}

// Error handling types
export interface VectorizeErrorContext {
	operation: VectorizeOperation;
	resource: VectorizeResource;
	indexName?: string;
	vectorId?: string;
	details?: IDataObject;
}

export class VectorizeOperationError extends Error {
	constructor(
		message: string,
		public context: VectorizeErrorContext,
		public originalError?: Error
	) {
		super(message);
		this.name = 'VectorizeOperationError';
	}
}

// Validation types
export interface VectorizeValidationResult {
	isValid: boolean;
	errors: string[];
	warnings: string[];
}

// Batch operation types
export interface VectorizeBatchConfig {
	maxBatchSize: number;
	maxRetries: number;
	retryDelay: number;
	concurrentBatches: number;
}

// Query options
export interface VectorizeQueryOptions {
	topK?: number;
	returnValues?: boolean;
	returnMetadata?: 'none' | 'indexed' | 'all';
	filter?: IDataObject;
	namespace?: string;
}

// Statistics and monitoring
export interface VectorizeOperationStats {
	operationType: VectorizeOperation;
	duration: number;
	vectorCount: number;
	success: boolean;
	errorMessage?: string;
}

export interface VectorizeIndexStats {
	name: string;
	dimensions: number;
	vectorCount: number;
	metadataIndexCount: number;
	lastUpdated: string;
}

// Advanced query types
export interface VectorizeSearchOptions {
	query: string;
	embeddingModel?: string;
	topK?: number;
	filter?: IDataObject;
	namespace?: string;
}

// Export utility type for getting operation parameters
export type VectorizeOperationParams<T extends VectorizeOperation> = 
	T extends 'create' ? VectorizeCreateIndexRequest :
	T extends 'insert' ? VectorizeInsertRequest :
	T extends 'upsert' ? VectorizeUpsertRequest :
	T extends 'query' ? VectorizeQueryRequest :
	T extends 'queryById' ? VectorizeQueryByIdRequest :
	T extends 'getByIds' ? VectorizeGetByIdsRequest :
	T extends 'deleteByIds' ? VectorizeDeleteByIdsRequest :
	T extends 'createIndex' ? VectorizeCreateMetadataIndexRequest :
	T extends 'deleteIndex' ? VectorizeDeleteMetadataIndexRequest :
	T extends 'listVectors' ? VectorizeListVectorsRequest :
	IDataObject;