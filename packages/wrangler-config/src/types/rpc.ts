/**
 * RPC type generation type definitions
 */

/**
 * RPC Type Definition metadata
 * 
 * Stores information about generated TypeScript types for inter-worker RPC
 */
export interface RPCTypeDefinition {
  /**
   * Worker name that exposes the RPC interface
   */
  workerName: string;

  /**
   * Path to generated type definitions
   */
  typesPath: string;

  /**
   * Whether types have been generated
   */
  generated: boolean;

  /**
   * Timestamp of last generation
   */
  generatedAt?: Date;

  /**
   * Version/hash of the worker source when types were generated
   */
  sourceVersion?: string;
}

/**
 * Service Binding Declaration
 * 
 * Metadata indicating a worker exposes RPC methods and should have types generated
 */
export interface ServiceBindingDeclaration {
  /**
   * Worker name
   */
  workerName: string;

  /**
   * Whether this worker exposes an RPC interface
   */
  exposeRPC: boolean;

  /**
   * Path to the worker's source file (for type generation)
   */
  sourcePath?: string;

  /**
   * Custom types export path (if different from default)
   */
  typesExportPath?: string;
}
