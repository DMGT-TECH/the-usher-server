const createError = require('http-errors')
const dbAdminPersona = require('database/layer/admin-persona')

async function createPersona(req, res, next) {
  try {
    const { tenant_key, sub_claim, user_context } = req.body;
    const persona = await dbAdminPersona.insertPersonaByTenantKey(tenant_key, sub_claim, user_context);
    res.status(201).send(persona);
  } catch (err) {
    return next(err);
  }
};

module.exports = { createPersona };
