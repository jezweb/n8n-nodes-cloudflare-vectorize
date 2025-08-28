import { IExecuteFunctions, ILoadOptionsFunctions, INodeListSearchItems, INodeListSearchResult } from 'n8n-workflow';
import {
	INodeType,
	INodeTypeDescription,
	IDataObject,
	INodeExecutionData,
	NodeOperationError,
	NodeConnectionType,
	INodePropertyOptions,
} from 'n8n-workflow';

import { CloudflareVectorizeUtils } from '../../utils/CloudflareVectorizeUtils';
import { 
	VectorizeOperation, 
	VectorizeResource,
	VectorizeDistanceMetric,
	VectorizeMetadataType,
	VectorizeVector,
	VectorizeConnectionConfig,
	VectorizeNodeParameters
} from '../../types/CloudflareVectorizeTypes';

export class CloudflareVectorize implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Cloudflare Vectorize',
		name: 'cloudflareVectorize',
		icon: 'file:cloudflare-vectorize.svg',
		group: ['database'],
		version: 1,
		subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
		description: 'Execute operations against Cloudflare Vectorize vector databases. Supports vector operations (insert, upsert, query), index management, metadata filtering, and can be used as a tool by AI Agents for semantic search and RAG applications.',
		defaults: {
			name: 'Cloudflare Vectorize',
		},
		inputs: [
			{
				displayName: 'Input',
				type: NodeConnectionType.Main,
			},
		],
		outputs: [
			{
				displayName: 'Output',
				type: NodeConnectionType.Main,
			},
		],
		credentials: [
			{
				name: 'cloudflareVectorizeApi',
				required: true,
			},
		],
		usableAsTool: true,
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				options: [
					{
						name: 'Index',
						value: 'index',
						description: 'Manage vector indexes (create, list, delete, get information)',
					},
					{
						name: 'Vector',
						value: 'vector',
						description: 'Work with vectors (insert, upsert, query, delete) for semantic search operations',
					},
					{
						name: 'Metadata',
						value: 'metadata',
						description: 'Configure metadata indexes to enable filtering during vector queries',
					},
					{
						name: 'Utility',
						value: 'utility',
						description: 'Utility operations (list vectors, describe index) for administration and debugging',
					},
				],
				default: 'vector',
				noDataExpression: true,
			},

			// Index Name (common parameter)
			{
				displayName: 'Index Name',
				name: 'indexName',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					hide: {
						resource: ['index'],
						operation: ['list'],
					},
				},
				description: 'The name of the Vectorize index. Must be lowercase, contain only letters, numbers, and hyphens.',
			},

			// INDEX RESOURCE OPERATIONS
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['index'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new vector index with specified dimensions and distance metric',
						action: 'Create a new vector index',
					},
					{
						name: 'List',
						value: 'list',
						description: 'List all available vector indexes in your account',
						action: 'List all vector indexes',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Permanently delete a vector index and all its data',
						action: 'Delete a vector index',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get detailed information about a specific vector index',
						action: 'Get vector index details',
					},
					{
						name: 'Info',
						value: 'info',
						description: 'Get statistics and metadata about a vector index (vector count, last update, etc.)',
						action: 'Get vector index statistics',
					},
				],
				default: 'create',
				noDataExpression: true,
			},

			// Index creation parameters
			{
				displayName: 'Index Name',
				name: 'indexName',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['index'],
						operation: ['create', 'delete', 'get', 'info'],
					},
				},
				description: 'The name for the new index. Must be unique, lowercase, and contain only letters, numbers, and hyphens.',
			},
			{
				displayName: 'Dimensions',
				name: 'dimensions',
				type: 'number',
				default: 1536,
				required: true,
				displayOptions: {
					show: {
						resource: ['index'],
						operation: ['create'],
					},
				},
				description: 'The number of dimensions for vectors in this index. Must match the dimensions of vectors you plan to insert. Common values: 1536 (OpenAI), 768 (sentence-transformers), 384 (MiniLM).',
			},
			{
				displayName: 'Distance Metric',
				name: 'metric',
				type: 'options',
				options: [
					{
						name: 'Cosine',
						value: 'cosine',
						description: 'Cosine similarity - recommended for most use cases including text embeddings',
					},
					{
						name: 'Euclidean',
						value: 'euclidean',
						description: 'Euclidean distance - good for spatial data and when magnitude matters',
					},
					{
						name: 'Dot Product',
						value: 'dot-product',
						description: 'Dot product similarity - fast but requires normalized vectors',
					},
				],
				default: 'cosine',
				displayOptions: {
					show: {
						resource: ['index'],
						operation: ['create'],
					},
				},
				description: 'The distance metric used for vector similarity calculations',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['index'],
						operation: ['create'],
					},
				},
				description: 'Optional description for the index to help identify its purpose',
			},

			// VECTOR RESOURCE OPERATIONS
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['vector'],
					},
				},
				options: [
					{
						name: 'Insert',
						value: 'insert',
						description: 'Insert new vectors into the index. Fails if vector IDs already exist.',
						action: 'Insert new vectors',
					},
					{
						name: 'Upsert',
						value: 'upsert',
						description: 'Insert new vectors or update existing ones. Overwrites vectors with matching IDs.',
						action: 'Insert or update vectors',
					},
					{
						name: 'Query',
						value: 'query',
						description: 'Search for vectors similar to a query vector using semantic similarity',
						action: 'Query similar vectors',
					},
					{
						name: 'Query by ID',
						value: 'queryById',
						description: 'Find vectors similar to an existing vector in the index',
						action: 'Query using existing vector',
					},
					{
						name: 'Get by IDs',
						value: 'getByIds',
						description: 'Retrieve specific vectors by their IDs',
						action: 'Get vectors by ID',
					},
					{
						name: 'Delete by IDs',
						value: 'deleteByIds',
						description: 'Delete specific vectors from the index by their IDs',
						action: 'Delete vectors by ID',
					},
				],
				default: 'query',
				noDataExpression: true,
			},

			// Vector operations - Insert/Upsert
			{
				displayName: 'Vectors',
				name: 'vectors',
				type: 'json',
				default: '[{\n  "id": "vector-1",\n  "values": [0.1, 0.2, 0.3],\n  "metadata": {"category": "example"},\n  "namespace": "default"\n}]',
				displayOptions: {
					show: {
						resource: ['vector'],
						operation: ['insert', 'upsert'],
					},
				},
				description: 'Array of vector objects to insert/upsert. Each must have: id (string), values (number array), optional metadata (object), optional namespace (string)',
			},

			// Vector operations - Query
			{
				displayName: 'Query Vector',
				name: 'queryVector',
				type: 'json',
				default: '[0.1, 0.2, 0.3]',
				displayOptions: {
					show: {
						resource: ['vector'],
						operation: ['query'],
					},
				},
				description: 'The vector to search for. Must be an array of numbers with the same dimensions as the index.',
			},

			// Vector operations - Query by ID
			{
				displayName: 'Vector ID',
				name: 'vectorId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['vector'],
						operation: ['queryById'],
					},
				},
				description: 'ID of an existing vector in the index to use as the query vector',
			},

			// Vector operations - Get/Delete by IDs
			{
				displayName: 'Vector IDs',
				name: 'vectorIds',
				type: 'json',
				default: '["vector-1", "vector-2"]',
				displayOptions: {
					show: {
						resource: ['vector'],
						operation: ['getByIds', 'deleteByIds'],
					},
				},
				description: 'Array of vector IDs to retrieve or delete',
			},

			// Query options
			{
				displayName: 'Top K',
				name: 'topK',
				type: 'number',
				default: 5,
				displayOptions: {
					show: {
						resource: ['vector'],
						operation: ['query', 'queryById'],
					},
				},
				description: 'Number of most similar vectors to return (1-100, or 1-20 if returning values/metadata)',
			},
			{
				displayName: 'Return Values',
				name: 'returnValues',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						resource: ['vector'],
						operation: ['query', 'queryById'],
					},
				},
				description: 'Whether to return the vector values in the results (increases response size)',
			},
			{
				displayName: 'Return Metadata',
				name: 'returnMetadata',
				type: 'options',
				options: [
					{
						name: 'None',
						value: 'none',
						description: 'Do not return metadata',
					},
					{
						name: 'Indexed Only',
						value: 'indexed',
						description: 'Return only metadata fields that have indexes (faster)',
					},
					{
						name: 'All',
						value: 'all',
						description: 'Return all metadata (may be slower)',
					},
				],
				default: 'none',
				displayOptions: {
					show: {
						resource: ['vector'],
						operation: ['query', 'queryById'],
					},
				},
				description: 'Which metadata to return in the query results',
			},
			{
				displayName: 'Filter',
				name: 'filter',
				type: 'json',
				default: '{}',
				displayOptions: {
					show: {
						resource: ['vector'],
						operation: ['query', 'queryById'],
					},
				},
				description: 'Metadata filter to apply to the query. Only vectors matching the filter will be considered. Requires metadata indexes.',
			},
			{
				displayName: 'Namespace',
				name: 'namespace',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['vector'],
						operation: ['query', 'queryById'],
					},
				},
				description: 'Optional namespace to search within. Only vectors in this namespace will be considered.',
			},

			// METADATA RESOURCE OPERATIONS
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['metadata'],
					},
				},
				options: [
					{
						name: 'Create Index',
						value: 'createIndex',
						description: 'Create a metadata index to enable filtering on a metadata property',
						action: 'Create metadata index',
					},
					{
						name: 'Delete Index',
						value: 'deleteIndex',
						description: 'Remove a metadata index (disables filtering on that property)',
						action: 'Delete metadata index',
					},
					{
						name: 'List Indexes',
						value: 'listIndexes',
						description: 'List all metadata indexes for the vector index',
						action: 'List metadata indexes',
					},
				],
				default: 'createIndex',
				noDataExpression: true,
			},

			// Metadata operations
			{
				displayName: 'Property Name',
				name: 'propertyName',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['metadata'],
						operation: ['createIndex', 'deleteIndex'],
					},
				},
				description: 'Name of the metadata property to index for filtering',
			},
			{
				displayName: 'Property Type',
				name: 'metadataType',
				type: 'options',
				options: [
					{
						name: 'String',
						value: 'string',
						description: 'Text values (first 64 bytes indexed)',
					},
					{
						name: 'Number',
						value: 'number',
						description: 'Numeric values (float64 precision)',
					},
					{
						name: 'Boolean',
						value: 'boolean',
						description: 'True/false values',
					},
				],
				default: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['metadata'],
						operation: ['createIndex'],
					},
				},
				description: 'The data type of the metadata property',
			},

			// UTILITY RESOURCE OPERATIONS
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['utility'],
					},
				},
				options: [
					{
						name: 'List Vectors',
						value: 'listVectors',
						description: 'List all vector IDs in the index with pagination',
						action: 'List vector IDs',
					},
					{
						name: 'Describe',
						value: 'describe',
						description: 'Get detailed configuration and schema information about the index',
						action: 'Describe index',
					},
				],
				default: 'listVectors',
				noDataExpression: true,
			},

			// List vectors pagination
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 100,
				displayOptions: {
					show: {
						resource: ['utility'],
						operation: ['listVectors'],
					},
				},
				description: 'Maximum number of vector IDs to return (1-1000)',
			},
			{
				displayName: 'Cursor',
				name: 'cursor',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['utility'],
						operation: ['listVectors'],
					},
				},
				description: 'Pagination cursor from a previous response to continue listing from that point',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: IDataObject[] = [];
		const config = await CloudflareVectorizeUtils.getConnectionConfig(this);

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as VectorizeResource;
				const operation = this.getNodeParameter('operation', i) as VectorizeOperation;
				
				let result: any;

				switch (resource) {
					case 'index':
						result = await this.executeIndexOperation(config, operation, i);
						break;
					case 'vector':
						result = await this.executeVectorOperation(config, operation, i);
						break;
					case 'metadata':
						result = await this.executeMetadataOperation(config, operation, i);
						break;
					case 'utility':
						result = await this.executeUtilityOperation(config, operation, i);
						break;
					default:
						throw new NodeOperationError(this.getNode(), `Unknown resource: ${resource}`, { itemIndex: i });
				}

				returnData.push({
					resource,
					operation,
					...result,
				});

			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: this.getInputData(i)[0].json,
						error: error.message,
					});
					continue;
				}
				throw error;
			}
		}

		return [this.helpers.returnJsonArray(returnData)];
	}

	private async executeIndexOperation(
		config: VectorizeConnectionConfig,
		operation: VectorizeOperation,
		itemIndex: number
	): Promise<IDataObject> {
		switch (operation) {
			case 'create': {
				const indexName = this.getNodeParameter('indexName', itemIndex) as string;
				const dimensions = this.getNodeParameter('dimensions', itemIndex) as number;
				const metric = this.getNodeParameter('metric', itemIndex) as VectorizeDistanceMetric;
				const description = this.getNodeParameter('description', itemIndex, '') as string;

				const result = await CloudflareVectorizeUtils.createIndex(
					this,
					config,
					{
						name: indexName,
						description: description || undefined,
						config: { dimensions, metric },
					},
					itemIndex
				);

				return { index: result };
			}

			case 'list': {
				const result = await CloudflareVectorizeUtils.listIndexes(this, config, itemIndex);
				return { indexes: result, count: result.length };
			}

			case 'delete': {
				const indexName = this.getNodeParameter('indexName', itemIndex) as string;
				await CloudflareVectorizeUtils.deleteIndex(this, config, indexName, itemIndex);
				return { success: true, indexName };
			}

			case 'get': {
				const indexName = this.getNodeParameter('indexName', itemIndex) as string;
				const result = await CloudflareVectorizeUtils.getIndex(this, config, indexName, itemIndex);
				return { index: result };
			}

			case 'info': {
				const indexName = this.getNodeParameter('indexName', itemIndex) as string;
				const result = await CloudflareVectorizeUtils.getIndexInfo(this, config, indexName, itemIndex);
				return { info: result };
			}

			default:
				throw new NodeOperationError(this.getNode(), `Unknown index operation: ${operation}`, { itemIndex });
		}
	}

	private async executeVectorOperation(
		config: VectorizeConnectionConfig,
		operation: VectorizeOperation,
		itemIndex: number
	): Promise<IDataObject> {
		const indexName = this.getNodeParameter('indexName', itemIndex) as string;

		switch (operation) {
			case 'insert': {
				const vectorsJson = this.getNodeParameter('vectors', itemIndex) as string | any[];
				const vectors = CloudflareVectorizeUtils.formatVectors(
					typeof vectorsJson === 'string' ? JSON.parse(vectorsJson) : vectorsJson
				);

				const result = await CloudflareVectorizeUtils.insertVectors(
					this,
					config,
					indexName,
					{ vectors },
					itemIndex
				);

				return { mutationId: result.mutationId, vectorCount: vectors.length };
			}

			case 'upsert': {
				const vectorsJson = this.getNodeParameter('vectors', itemIndex) as string | any[];
				const vectors = CloudflareVectorizeUtils.formatVectors(
					typeof vectorsJson === 'string' ? JSON.parse(vectorsJson) : vectorsJson
				);

				const result = await CloudflareVectorizeUtils.upsertVectors(
					this,
					config,
					indexName,
					{ vectors },
					itemIndex
				);

				return { mutationId: result.mutationId, vectorCount: vectors.length };
			}

			case 'query': {
				const queryVectorJson = this.getNodeParameter('queryVector', itemIndex) as string | number[];
				const queryVector = typeof queryVectorJson === 'string' ? JSON.parse(queryVectorJson) : queryVectorJson;
				const topK = this.getNodeParameter('topK', itemIndex, 5) as number;
				const returnValues = this.getNodeParameter('returnValues', itemIndex, false) as boolean;
				const returnMetadata = this.getNodeParameter('returnMetadata', itemIndex, 'none') as 'none' | 'indexed' | 'all';
				const filterJson = this.getNodeParameter('filter', itemIndex, '{}') as string | IDataObject;
				const filter = typeof filterJson === 'string' ? JSON.parse(filterJson) : filterJson;
				const namespace = this.getNodeParameter('namespace', itemIndex, '') as string;

				const queryRequest: any = {
					vector: queryVector,
					topK,
					returnValues,
					returnMetadata,
				};

				if (Object.keys(filter).length > 0) {
					queryRequest.filter = filter;
				}

				if (namespace) {
					queryRequest.namespace = namespace;
				}

				const result = await CloudflareVectorizeUtils.queryVectors(
					this,
					config,
					indexName,
					queryRequest,
					itemIndex
				);

				return { query: result };
			}

			case 'queryById': {
				const vectorId = this.getNodeParameter('vectorId', itemIndex) as string;
				const topK = this.getNodeParameter('topK', itemIndex, 5) as number;
				const returnValues = this.getNodeParameter('returnValues', itemIndex, false) as boolean;
				const returnMetadata = this.getNodeParameter('returnMetadata', itemIndex, 'none') as 'none' | 'indexed' | 'all';
				const filterJson = this.getNodeParameter('filter', itemIndex, '{}') as string | IDataObject;
				const filter = typeof filterJson === 'string' ? JSON.parse(filterJson) : filterJson;
				const namespace = this.getNodeParameter('namespace', itemIndex, '') as string;

				const queryRequest: any = {
					id: vectorId,
					topK,
					returnValues,
					returnMetadata,
				};

				if (Object.keys(filter).length > 0) {
					queryRequest.filter = filter;
				}

				if (namespace) {
					queryRequest.namespace = namespace;
				}

				const result = await CloudflareVectorizeUtils.queryVectorById(
					this,
					config,
					indexName,
					queryRequest,
					itemIndex
				);

				return { query: result };
			}

			case 'getByIds': {
				const vectorIdsJson = this.getNodeParameter('vectorIds', itemIndex) as string | string[];
				const vectorIds = typeof vectorIdsJson === 'string' ? JSON.parse(vectorIdsJson) : vectorIdsJson;

				const result = await CloudflareVectorizeUtils.getVectorsByIds(
					this,
					config,
					indexName,
					{ ids: vectorIds },
					itemIndex
				);

				return { vectors: result.vectors, count: result.vectors.length };
			}

			case 'deleteByIds': {
				const vectorIdsJson = this.getNodeParameter('vectorIds', itemIndex) as string | string[];
				const vectorIds = typeof vectorIdsJson === 'string' ? JSON.parse(vectorIdsJson) : vectorIdsJson;

				const result = await CloudflareVectorizeUtils.deleteVectorsByIds(
					this,
					config,
					indexName,
					{ ids: vectorIds },
					itemIndex
				);

				return { mutationId: result.mutationId, deletedCount: vectorIds.length };
			}

			default:
				throw new NodeOperationError(this.getNode(), `Unknown vector operation: ${operation}`, { itemIndex });
		}
	}

	private async executeMetadataOperation(
		config: VectorizeConnectionConfig,
		operation: VectorizeOperation,
		itemIndex: number
	): Promise<IDataObject> {
		const indexName = this.getNodeParameter('indexName', itemIndex) as string;

		switch (operation) {
			case 'createIndex': {
				const propertyName = this.getNodeParameter('propertyName', itemIndex) as string;
				const metadataType = this.getNodeParameter('metadataType', itemIndex) as VectorizeMetadataType;

				const result = await CloudflareVectorizeUtils.createMetadataIndex(
					this,
					config,
					indexName,
					{ propertyName, type: metadataType },
					itemIndex
				);

				return { mutationId: result.mutationId, propertyName, type: metadataType };
			}

			case 'deleteIndex': {
				const propertyName = this.getNodeParameter('propertyName', itemIndex) as string;

				const result = await CloudflareVectorizeUtils.deleteMetadataIndex(
					this,
					config,
					indexName,
					{ propertyName },
					itemIndex
				);

				return { mutationId: result.mutationId, propertyName };
			}

			case 'listIndexes': {
				const result = await CloudflareVectorizeUtils.listMetadataIndexes(
					this,
					config,
					indexName,
					itemIndex
				);

				return { metadataIndexes: result.metadataIndexes, count: result.metadataIndexes.length };
			}

			default:
				throw new NodeOperationError(this.getNode(), `Unknown metadata operation: ${operation}`, { itemIndex });
		}
	}

	private async executeUtilityOperation(
		config: VectorizeConnectionConfig,
		operation: VectorizeOperation,
		itemIndex: number
	): Promise<IDataObject> {
		const indexName = this.getNodeParameter('indexName', itemIndex) as string;

		switch (operation) {
			case 'listVectors': {
				const limit = this.getNodeParameter('limit', itemIndex, 100) as number;
				const cursor = this.getNodeParameter('cursor', itemIndex, '') as string;

				const request: any = { limit };
				if (cursor) {
					request.cursor = cursor;
				}

				const result = await CloudflareVectorizeUtils.listVectors(
					this,
					config,
					indexName,
					request,
					itemIndex
				);

				return { 
					vectors: result.vectors,
					count: result.count,
					totalCount: result.totalCount,
					isTruncated: result.isTruncated,
					cursor: result.cursor,
				};
			}

			case 'describe': {
				const result = await CloudflareVectorizeUtils.describeIndex(
					this,
					config,
					indexName,
					itemIndex
				);

				return { index: result };
			}

			default:
				throw new NodeOperationError(this.getNode(), `Unknown utility operation: ${operation}`, { itemIndex });
		}
	}
}