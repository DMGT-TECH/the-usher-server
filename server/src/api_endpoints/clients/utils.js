const dbAdminRole = require('database/layer/admin-client')
const dbAdminPermission = require('database/layer/admin-permission')

const checkClientExists = async (clientId) => {
  try {
    return await dbAdminRole.getClient(clientId);
  } catch {
    const error = new Error('Client does not exist!')
    error.httpStatusCode = 404
    throw error
  }
}

/**
 * Checks the uniqueness of a permission name for a given client key.
 *
 * This function queries the database to retrieve permissions by name and client key.
 * If any permissions are found, it throws an error indicating the name is already taken.
 *
 * @async
 * @function checkPermissionNameUniqueness
 * @param {Object} params - The parameters for checking uniqueness.
 * @param {string} params.name - The name of the permission to check.
 * @param {string} params.clientkey - The client key associated with the permission.
 * @throws {Object} Throws an error with HTTP status code 409 if the permission name is not unique.
 * @throws {number} error.httpStatusCode - The HTTP status code indicating conflict (409).
 * @throws {string} error.message - The error message indicating the permission name is taken.
 */
const checkPermissionNameUniqueness = async ({ name, clientkey: clientKey }) => {
  const permissions = await dbAdminPermission.getPermissionsByNameClientKey(name, clientKey);
  if (permissions?.length) {
    const error = new Error('The permission name is taken!')
    error.httpStatusCode = 409
    throw error
  }
};

module.exports = {
  checkClientExists,
  checkPermissionNameUniqueness,
}
