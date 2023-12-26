const dbAdminPersona = require('database/layer/admin-persona')

const checkPersonaExists = async (personaKey) => {
  const persona = await dbAdminPersona.getPersona(personaKey)
  if (!persona) {
    throw {
      httpStatusCode: 404,
      message: 'Persona does not exist!'
    }
  }
}

module.exports = {
  checkPersonaExists,
}
