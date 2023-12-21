const { PgErrorCodes } = require('../constant/PgErrorCodes')

/**
   * Handles database errors into a generic message and appropriate http status code
   * @param pgDbError The error thrown by the database.
   * @returns {message: text, httpStatusCode: number} 
*/
const pgErrorHandler = (pgDbError) => {
  const error = {}
  switch (pgDbError.code) {
    case PgErrorCodes.UniqueViolation:
      error.message = 'The operation would result in duplicate resources!'
      error.httpStatusCode = 409
      break

    case PgErrorCodes.CheckViolation:
      error.message = 'The operation would violate a check constraint!'
      error.httpStatusCode = 400
      break

    case PgErrorCodes.NotNullViolation:
      error.message = 'A required value is missing!'
      error.httpStatusCode = 400
      break

    case PgErrorCodes.ForeignKeyViolation:
      error.message = 'Referenced resource is invalid!'
      error.httpStatusCode = 400
      break

    case PgErrorCodes.InvalidTextRepresentation:
      error.message = 'The provided data format is invalid!'
      error.httpStatusCode = 400
      break

    case PgErrorCodes.SerializationFailure:
      error.message = 'Internal DB Error: A transaction serialization error occurred!'
      error.httpStatusCode = 500
      break

    case PgErrorCodes.DeadlockDetected:
      error.message = 'Internal DB Error: The operation was halted due to a potential deadlock!'
      error.httpStatusCode = 500
      break

    case PgErrorCodes.SyntaxError:
      error.message = 'Internal DB Error: There is a syntax error in the provided SQL or data!'
      error.httpStatusCode = 500
      break

    case PgErrorCodes.UndefinedTable:
      error.message = 'Internal DB Error: The table or view you are trying to access does not exist!'
      error.httpStatusCode = 500
      break

    case PgErrorCodes.DiskFull:
      error.message = 'Internal DB Error: The operation failed due to insufficient disk space!'
      error.httpStatusCode = 500
      break

    case PgErrorCodes.OutOfMemory:
      error.message = 'Internal DB Error: The system ran out of memory!'
      error.httpStatusCode = 500
      break

    case PgErrorCodes.TooManyConnections:
      error.message = 'Internal DB Error: There are too many connections to the database!'
      error.httpStatusCode = 500
      break

    default:
      error.message = `Unexpected Error: ${error?.message}!`
      error.httpStatusCode = 500
      break
  }

  return error
}

module.exports = {
  pgErrorHandler,
}
