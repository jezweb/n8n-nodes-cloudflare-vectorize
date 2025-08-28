import { IExecuteFunctions, IDataObject, NodeOperationError, IHttpRequestMethods } from 'n8n-workflow';
import { 
	VectorizeConnectionConfig,
	VectorizeApiError,
	VectorizeOperation,
	VectorizeResource,
	VectorizeErrorContext,
	VectorizeIndex,
	VectorizeIndexInfo,
	VectorizeVector,
	VectorizeQueryResult,
	VectorizeQueryRequest,
	VectorizeQueryByIdRequest,
	VectorizeGetByIdsRequest,
	VectorizeDeleteByIdsRequest,
	VectorizeCreateIndexRequest,
	VectorizeInsertRequest,
	VectorizeUpsertRequest,
	VectorizeCreateMetadataIndexRequest,
	VectorizeDeleteMetadataIndexRequest,
	VectorizeListVectorsRequest,
	VectorizeMutationResponse,
	VectorizeListIndexesResponse,
	VectorizeGetByIdsResponse,
	VectorizeListMetadataIndexesResponse,
	VectorizeListVectorsResponse
} from '../types/CloudflareVectorizeTypes';

export class CloudflareVectorizeUtils {
	/**
	 * Execute an API request to Cloudflare Vectorize
	 */
	static async executeRequest<T = any>(
		context: IExecuteFunctions,
		config: VectorizeConnectionConfig,
		endpoint: string,
		method: IHttpRequestMethods = 'GET',
		body?: IDataObject,
		itemIndex = 0
	): Promise<T> {
		const url = `${config.apiEndpoint}/accounts/${config.accountId}/vectorize/v2/${endpoint}`;
		
		const httpOptions = {
			method,
			headers: {
				'Authorization': `Bearer ${config.apiToken}`,
				'Content-Type': 'application/json',
			},
			url,
			json: true,
			body,
		};

		try {
			const response = await context.helpers.httpRequestWithAuthentication.call(
				context,
				'cloudflareVectorizeApi',
				httpOptions
			);

			// Handle Cloudflare API response format
			if (response.success === false) {
				const errors = response.errors || [];
				const errorMessages = errors.map((error: VectorizeApiError) => error.message).join(', ');
				throw new NodeOperationError(
					context.getNode(),
					`Cloudflare API error: ${errorMessages}`,
					{ itemIndex }
				);
			}

			return response.result || response;
		} catch (error: any) {
			if (error instanceof NodeOperationError) {
				throw error;
			}
			
			// Handle HTTP errors
			if (error.response?.status) {
				const status = error.response.status;
				const data = error.response.data;
				
				let errorMessage = `HTTP ${status} error`;
				if (data?.errors?.length > 0) {
					const apiErrors = data.errors.map((e: VectorizeApiError) => e.message).join(', ');
					errorMessage = `API error: ${apiErrors}`;
				} else if (data?.message) {
					errorMessage = `API error: ${data.message}`;
				}
				
				throw new NodeOperationError(context.getNode(), errorMessage, { itemIndex });
			}
			
			// Generic error handling
			throw new NodeOperationError(
				context.getNode(),
				`Request failed: ${error.message}`,
				{ itemIndex }
			);
		}
	}

	/**
	 * Get connection configuration from credentials
	 */
	static async getConnectionConfig(context: IExecuteFunctions): Promise<VectorizeConnectionConfig> {
		const credentials = await context.getCredentials('cloudflareVectorizeApi');
		
		return {
			accountId: credentials.accountId as string,
			apiToken: credentials.apiToken as string,
			apiEndpoint: credentials.apiEndpoint as string,
		};
	}

	/**
	 * Validate vector dimensions
	 */
	static validateVectorDimensions(vectors: VectorizeVector[], expectedDimensions?: number): void {
		for (const vector of vectors) {
			if (!vector.values || !Array.isArray(vector.values) && !(vector.values instanceof Float32Array) && !(vector.values instanceof Float64Array)) {
				throw new Error(`Vector ${vector.id} must have a 'values' array`);
			}
			
			if (expectedDimensions && vector.values.length !== expectedDimensions) {
				throw new Error(`Vector ${vector.id} has ${vector.values.length} dimensions, expected ${expectedDimensions}`);
			}
			
			if (!vector.id || typeof vector.id !== 'string') {
				throw new Error('All vectors must have a valid string ID');
			}
		}
	}

	/**
	 * Validate index name
	 */
	static validateIndexName(indexName: string): void {
		if (!indexName || typeof indexName !== 'string') {
			throw new Error('Index name is required and must be a string');
		}
		
		if (indexName.length > 63) {
			throw new Error('Index name must be 63 characters or less');
		}
		
		if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(indexName) && indexName.length > 1) {
			throw new Error('Index name must contain only lowercase letters, numbers, and hyphens, and cannot start or end with a hyphen');
		}
	}

	// Index Operations
	static async createIndex(
		context: IExecuteFunctions,
		config: VectorizeConnectionConfig,
		request: VectorizeCreateIndexRequest,
		itemIndex = 0
	): Promise<VectorizeIndex> {
		this.validateIndexName(request.name);
		
		if (!request.config?.dimensions || request.config.dimensions < 1) {
			throw new Error('Dimensions must be a positive integer');
		}
		
		return this.executeRequest<VectorizeIndex>(
			context,
			config,
			'indexes',
			'POST',
			request,
			itemIndex
		);
	}

	static async listIndexes(
		context: IExecuteFunctions,
		config: VectorizeConnectionConfig,
		itemIndex = 0
	): Promise<VectorizeIndex[]> {
		const response = await this.executeRequest<VectorizeListIndexesResponse>(
			context,
			config,
			'indexes',
			'GET',
			undefined,
			itemIndex
		);
		
		return response.indexes || response as any;
	}

	static async deleteIndex(
		context: IExecuteFunctions,
		config: VectorizeConnectionConfig,
		indexName: string,
		itemIndex = 0
	): Promise<void> {
		this.validateIndexName(indexName);
		
		await this.executeRequest(
			context,
			config,
			`indexes/${indexName}`,
			'DELETE',
			undefined,
			itemIndex
		);
	}

	static async getIndex(
		context: IExecuteFunctions,
		config: VectorizeConnectionConfig,
		indexName: string,
		itemIndex = 0
	): Promise<VectorizeIndex> {
		this.validateIndexName(indexName);
		
		return this.executeRequest<VectorizeIndex>(
			context,
			config,
			`indexes/${indexName}`,
			'GET',
			undefined,
			itemIndex
		);
	}

	static async getIndexInfo(
		context: IExecuteFunctions,
		config: VectorizeConnectionConfig,
		indexName: string,
		itemIndex = 0
	): Promise<VectorizeIndexInfo> {
		this.validateIndexName(indexName);
		
		return this.executeRequest<VectorizeIndexInfo>(
			context,
			config,
			`indexes/${indexName}/info`,
			'GET',
			undefined,
			itemIndex
		);
	}

	// Vector Operations
	static async insertVectors(
		context: IExecuteFunctions,
		config: VectorizeConnectionConfig,
		indexName: string,
		request: VectorizeInsertRequest,
		itemIndex = 0
	): Promise<VectorizeMutationResponse> {
		this.validateIndexName(indexName);
		this.validateVectorDimensions(request.vectors);
		
		return this.executeRequest<VectorizeMutationResponse>(
			context,
			config,
			`indexes/${indexName}/insert`,
			'POST',
			request,
			itemIndex
		);
	}

	static async upsertVectors(
		context: IExecuteFunctions,
		config: VectorizeConnectionConfig,
		indexName: string,
		request: VectorizeUpsertRequest,
		itemIndex = 0
	): Promise<VectorizeMutationResponse> {
		this.validateIndexName(indexName);
		this.validateVectorDimensions(request.vectors);
		
		return this.executeRequest<VectorizeMutationResponse>(
			context,
			config,
			`indexes/${indexName}/upsert`,
			'POST',
			request,
			itemIndex
		);
	}

	static async queryVectors(
		context: IExecuteFunctions,
		config: VectorizeConnectionConfig,
		indexName: string,
		request: VectorizeQueryRequest,
		itemIndex = 0
	): Promise<VectorizeQueryResult> {
		this.validateIndexName(indexName);
		
		if (!request.vector || !Array.isArray(request.vector)) {
			throw new Error('Query vector is required and must be an array');
		}
		
		return this.executeRequest<VectorizeQueryResult>(
			context,
			config,
			`indexes/${indexName}/query`,
			'POST',
			request,
			itemIndex
		);
	}

	static async queryVectorById(
		context: IExecuteFunctions,
		config: VectorizeConnectionConfig,
		indexName: string,
		request: VectorizeQueryByIdRequest,
		itemIndex = 0
	): Promise<VectorizeQueryResult> {
		this.validateIndexName(indexName);
		
		if (!request.id || typeof request.id !== 'string') {
			throw new Error('Vector ID is required and must be a string');
		}
		
		return this.executeRequest<VectorizeQueryResult>(
			context,
			config,
			`indexes/${indexName}/query`,
			'POST',
			{
				...request,
				vector: request.id, // API expects 'vector' field for queryById
			},
			itemIndex
		);
	}

	static async getVectorsByIds(
		context: IExecuteFunctions,
		config: VectorizeConnectionConfig,
		indexName: string,
		request: VectorizeGetByIdsRequest,
		itemIndex = 0
	): Promise<VectorizeGetByIdsResponse> {
		this.validateIndexName(indexName);
		
		if (!request.ids || !Array.isArray(request.ids) || request.ids.length === 0) {
			throw new Error('Vector IDs are required and must be a non-empty array');
		}
		
		return this.executeRequest<VectorizeGetByIdsResponse>(
			context,
			config,
			`indexes/${indexName}/get_by_ids`,
			'POST',
			request,
			itemIndex
		);
	}

	static async deleteVectorsByIds(
		context: IExecuteFunctions,
		config: VectorizeConnectionConfig,
		indexName: string,
		request: VectorizeDeleteByIdsRequest,
		itemIndex = 0
	): Promise<VectorizeMutationResponse> {
		this.validateIndexName(indexName);
		
		if (!request.ids || !Array.isArray(request.ids) || request.ids.length === 0) {
			throw new Error('Vector IDs are required and must be a non-empty array');
		}
		
		return this.executeRequest<VectorizeMutationResponse>(
			context,
			config,
			`indexes/${indexName}/delete_by_ids`,
			'POST',
			request,
			itemIndex
		);
	}

	// Metadata Operations
	static async createMetadataIndex(
		context: IExecuteFunctions,
		config: VectorizeConnectionConfig,
		indexName: string,
		request: VectorizeCreateMetadataIndexRequest,
		itemIndex = 0
	): Promise<VectorizeMutationResponse> {
		this.validateIndexName(indexName);
		
		if (!request.propertyName || typeof request.propertyName !== 'string') {
			throw new Error('Property name is required and must be a string');
		}
		
		return this.executeRequest<VectorizeMutationResponse>(
			context,
			config,
			`indexes/${indexName}/metadata_index/create`,
			'POST',
			request,
			itemIndex
		);
	}

	static async deleteMetadataIndex(
		context: IExecuteFunctions,
		config: VectorizeConnectionConfig,
		indexName: string,
		request: VectorizeDeleteMetadataIndexRequest,
		itemIndex = 0
	): Promise<VectorizeMutationResponse> {
		this.validateIndexName(indexName);
		
		if (!request.propertyName || typeof request.propertyName !== 'string') {
			throw new Error('Property name is required and must be a string');
		}
		
		return this.executeRequest<VectorizeMutationResponse>(
			context,
			config,
			`indexes/${indexName}/metadata_index/delete`,
			'POST',
			request,
			itemIndex
		);
	}

	static async listMetadataIndexes(
		context: IExecuteFunctions,
		config: VectorizeConnectionConfig,
		indexName: string,
		itemIndex = 0
	): Promise<VectorizeListMetadataIndexesResponse> {
		this.validateIndexName(indexName);
		
		return this.executeRequest<VectorizeListMetadataIndexesResponse>(
			context,
			config,
			`indexes/${indexName}/metadata_index/list`,
			'GET',
			undefined,
			itemIndex
		);
	}

	// Utility Operations
	static async listVectors(
		context: IExecuteFunctions,
		config: VectorizeConnectionConfig,
		indexName: string,
		request: VectorizeListVectorsRequest = {},
		itemIndex = 0
	): Promise<VectorizeListVectorsResponse> {
		this.validateIndexName(indexName);
		
		const queryParams = new URLSearchParams();
		if (request.cursor) queryParams.append('cursor', request.cursor);
		if (request.limit) queryParams.append('limit', request.limit.toString());
		
		const endpoint = `indexes/${indexName}/list${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
		
		return this.executeRequest<VectorizeListVectorsResponse>(
			context,
			config,
			endpoint,
			'GET',
			undefined,
			itemIndex
		);
	}

	static async describeIndex(
		context: IExecuteFunctions,
		config: VectorizeConnectionConfig,
		indexName: string,
		itemIndex = 0
	): Promise<VectorizeIndex> {
		// Describe is the same as get for Vectorize
		return this.getIndex(context, config, indexName, itemIndex);
	}

	/**
	 * Helper method to create error context
	 */
	static createErrorContext(
		operation: VectorizeOperation,
		resource: VectorizeResource,
		indexName?: string,
		details?: IDataObject
	): VectorizeErrorContext {
		return {
			operation,
			resource,
			indexName,
			details,
		};
	}

	/**
	 * Format vector data for API consumption
	 */
	static formatVectors(vectors: any[]): VectorizeVector[] {
		return vectors.map((vector, index) => {
			if (typeof vector !== 'object' || !vector) {
				throw new Error(`Vector at index ${index} must be an object`);
			}

			if (!vector.id) {
				throw new Error(`Vector at index ${index} must have an 'id' field`);
			}

			if (!vector.values || (!Array.isArray(vector.values) && !(vector.values instanceof Float32Array) && !(vector.values instanceof Float64Array))) {
				throw new Error(`Vector at index ${index} must have a 'values' array`);
			}

			const formatted: VectorizeVector = {
				id: String(vector.id),
				values: vector.values,
			};

			if (vector.metadata) {
				formatted.metadata = vector.metadata;
			}

			if (vector.namespace) {
				formatted.namespace = String(vector.namespace);
			}

			return formatted;
		});
	}

	/**
	 * Batch vectors to respect API limits
	 */
	static batchVectors(vectors: VectorizeVector[], batchSize = 1000): VectorizeVector[][] {
		const batches: VectorizeVector[][] = [];
		
		for (let i = 0; i < vectors.length; i += batchSize) {
			batches.push(vectors.slice(i, i + batchSize));
		}
		
		return batches;
	}

	/**
	 * Sleep utility for rate limiting
	 */
	static async sleep(ms: number): Promise<void> {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
}