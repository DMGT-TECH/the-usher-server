const dbAdminRole = require('database/layer/admin-client')

const checkClientExists = async (clientId) => {
  try {
    await dbAdminRole.getClient(clientId);
  } catch {
    throw {
      httpStatusCode: 404,
      message: 'Client does not exist!',
    }
  }
}

module.exports = {
  checkClientExists,
}
