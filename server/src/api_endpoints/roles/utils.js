const dbAdminRole = require('database/layer/admin-role')

const checkRoleExists = async (roleKey) => {
  const role = await dbAdminRole.getRole(roleKey)
  if (!role) {
    throw {
      httpStatusCode: 404,
      message: 'Role does not exist!'
    }
  }
}

module.exports = {
  checkRoleExists,
}
