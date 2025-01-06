const createError = require('http-errors')
const dbAdminTenant = require('database/layer/admin-tenant')

/**
 * HTTP Request handler
 * Get tenants with optional filtering, sorting, and ordering
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object to send 200 statusCode and a list of tenants
 * @param {Function} next - The callback function for the next middleware
 * @returns {Promise<void>} - A promise that resolves to void when tenants are retrieved
 */
const getTenants = async (req, res, next) => {
  try {
    const { sort, order } = req.query
    const allowedFilterParameters = ['key', 'name', 'iss_claim']
    const filters = allowedFilterParameters.reduce((acc, filter) => {
      const filterValue = req.query[filter]
      if (filterValue) {
        acc[filter] = filterValue
      }
      return acc
    }, {})
    const tenants = await dbAdminTenant.getTenants(filters, sort, order)
    res.status(200).send(tenants)
  } catch ({ httpStatusCode = 500, message }) {
    return next(createError(httpStatusCode, { message }))
  }
}

module.exports = {
  getTenants,
}
