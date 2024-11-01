const { PgErrorCodes } = require('../constant/PgErrorCodes')

/**
   * Handles database errors into a generic message and appropriate http status code
   * @param pgDbError The error thrown by the database.
   * @returns {message: text, httpStatusCode: number}
*/
const pgErrorHandler = (pgDbError) => {
  let errorMessage;
  let httpStatusCode;
  switch (pgDbError.code) {
    case PgErrorCodes.UniqueViolation:
      errorMessage = 'The operation would result in duplicate resources!'
      httpStatusCode = 409
      break

    case PgErrorCodes.CheckViolation:
      errorMessage = 'The operation would violate a check constraint!'
      httpStatusCode = 400
      break

    case PgErrorCodes.NotNullViolation:
      errorMessage = 'A required value is missing!'
      httpStatusCode = 400
      break

    case PgErrorCodes.ForeignKeyViolation:
      errorMessage = 'Referenced resource is invalid!'
      httpStatusCode = 400
      break

    case PgErrorCodes.InvalidTextRepresentation:
      errorMessage = 'The provided data format is invalid!'
      httpStatusCode = 400
      break

    case PgErrorCodes.UndefinedColumn:
      errorMessage = 'Internal DB Error: Bad query - Specified column is invalid!'
      httpStatusCode = 500
      break

    case PgErrorCodes.SerializationFailure:
      errorMessage = 'Internal DB Error: A transaction serialization error occurred!'
      httpStatusCode = 500
      break

    case PgErrorCodes.DeadlockDetected:
      errorMessage = 'Internal DB Error: The operation was halted due to a potential deadlock!'
      httpStatusCode = 500
      break

    case PgErrorCodes.SyntaxError:
      errorMessage = 'Internal DB Error: There is a syntax error in the provided SQL or data!'
      httpStatusCode = 500
      break

    case PgErrorCodes.UndefinedTable:
      errorMessage = 'Internal DB Error: The table or view you are trying to access does not exist!'
      httpStatusCode = 500
      break

    case PgErrorCodes.DiskFull:
      errorMessage = 'Internal DB Error: The operation failed due to insufficient disk space!'
      httpStatusCode = 500
      break

    case PgErrorCodes.OutOfMemory:
      errorMessage = 'Internal DB Error: The system ran out of memory!'
      httpStatusCode = 500
      break

    case PgErrorCodes.TooManyConnections:
      errorMessage = 'Internal DB Error: There are too many connections to the database!'
      httpStatusCode = 500
      break

    default:
      errorMessage = `Unexpected DB Error - Code: ${pgDbError?.code}, Message: ${pgDbError?.message}, Error: ${JSON.stringify(pgDbError)}`
      httpStatusCode = 503
      break
  }
  const error = new Error(errorMessage)
  error.httpStatusCode = httpStatusCode
  return error
}

module.exports = {
  pgErrorHandler,
}
