const createError = require('http-errors')
const dbAdminPersona = require('database/layer/admin-persona')

const createPersona = async (req, res, next) => {
  try {
    const { tenant_key, sub_claim, user_context } = req.body
    const persona = await dbAdminPersona.insertPersonaByTenantKey(tenant_key, sub_claim, user_context)
    res.status(201).send(persona)
  } catch ({ httpStatusCode = 500, message }) {
    return next(createError(httpStatusCode, { message }))
  }
}

module.exports = {
  createPersona,
}
