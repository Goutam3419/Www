export type DatabaseErrorCode = 
  | 'CONFIGURATION_ERROR'
  | 'CONNECTION_ERROR'
  | 'VALIDATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'QUERY_FAILURE'
  | 'UNKNOWN_ERROR';

export class DatabaseError extends Error {
  public readonly code: DatabaseErrorCode;
  public readonly details?: unknown;

  constructor(message: string, code: DatabaseErrorCode = 'UNKNOWN_ERROR', details?: unknown) {
    super(message);
    this.name = 'DatabaseError';
    this.code = code;
    this.details = details;
  }
}

export class DatabaseConfigError extends DatabaseError {
  constructor(message: string, details?: unknown) {
    super(message, 'CONFIGURATION_ERROR', details);
    this.name = 'DatabaseConfigError';
  }
}

export class DatabaseConnectionError extends DatabaseError {
  constructor(message: string, details?: unknown) {
    super(message, 'CONNECTION_ERROR', details);
    this.name = 'DatabaseConnectionError';
  }
}

export class NotFoundDatabaseError extends DatabaseError {
  constructor(message: string, details?: unknown) {
    super(message, 'NOT_FOUND', details);
    this.name = 'NotFoundDatabaseError';
  }
}

export class DatabaseQueryError extends DatabaseError {
  constructor(message: string, details?: unknown) {
    super(message, 'QUERY_FAILURE', details);
    this.name = 'DatabaseQueryError';
  }
}
