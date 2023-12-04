export const PgErrorCodes = {
  // Class 08 - Connection Exception
  ConnectionException: '08000',
  ConnectionDoesNotExist: '08003',
  ConnectionFailure: '08006',

  // Class 22 - Data Exception
  DataException: '22000',
  NullValueNotAllowed: '22004',
  NumericValueOutOfRange: '22003',
  InvalidTextRepresentation: '22P02',

  // Class 23 - Integrity Constraint Violation
  IntegrityConstraintViolation: '23000',
  NotNullViolation: '23502',
  ForeignKeyViolation: '23503',
  UniqueViolation: '23505',
  CheckViolation: '23514',

  // Class 25 - Invalid Transaction State
  InvalidTransactionState: '25000',
  ActiveSQLTransaction: '25001',
  InFailedSQLTransaction: '25P02',

  // Class 28 - Invalid Authorization Specification
  InvalidAuthorizationSpecification: '28000',
  InvalidPassword: '28P01',

  // Class 40 - Transaction Rollback
  TransactionRollback: '40000',
  SerializationFailure: '40001',
  DeadlockDetected: '40P01',

  // Class 42 - Syntax Error or Access Rule Violation
  SyntaxErrorOrAccessRuleViolation: '42000',
  SyntaxError: '42601',
  UndefinedColumn: '42703',
  UndefinedTable: '42P01',
  DuplicateColumn: '42701',
  DuplicateTable: '42P07',

  // Class 53 - Insufficient Resources
  InsufficientResources: '53000',
  DiskFull: '53100',
  OutOfMemory: '53200',
  TooManyConnections: '53300',

  // Class 54 - Program Limit Exceeded
  ProgramLimitExceeded: '54000',
  StatementTooComplex: '54001',
};
