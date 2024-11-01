const dbAdminRole = require('database/layer/admin-role')

const checkRoleExists = async (roleKey) => {
  const role = await dbAdminRole.getRole(roleKey)
  if (!role) {
    const error = new Error('Role does not exist!')
    error.httpStatusCode = 404
    throw error
  }
}

module.exports = {
  checkRoleExists,
}
