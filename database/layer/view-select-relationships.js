const { PGPool } = require('./pg_pool')
const pool = new PGPool()

function getTenantPersonaClientsView () {
  return `SELECT DISTINCT c.client_id, c.name AS clientname
            FROM usher.tenants t
            JOIN usher.tenantclients tc ON t.key = tc.tenantkey
            JOIN usher.clients c ON c.key = tc.clientkey
            LEFT JOIN (
              SELECT pr.personakey AS personakey, r.clientkey AS clientkey
              FROM usher.roles r
              JOIN usher.personaroles pr ON pr.rolekey = r.key
              UNION
              SELECT pp.personakey AS personakey, pe.clientkey AS clientkey
              FROM usher.permissions pe
              JOIN usher.personapermissions pp ON pp.permissionkey = pe.key
            ) rp ON rp.clientkey = c.key
            JOIN usher.personas p ON rp.personakey = p.key AND p.tenantkey = t.key`
}

async function selectTenantPersonaClients (subClaim = '*', userContext = '*', clientId = '*') {
  try {
    let sql = `${getTenantPersonaClientsView()} WHERE 1=1`
    const params = []
    let paramCount = 0
    if (subClaim !== '*') {
      params.push(subClaim)
      paramCount++
      sql += ' AND p.sub_claim = $' + paramCount
    }
    if (userContext !== '*') {
      params.push(userContext)
      paramCount++
      sql += ' AND p.user_context = $' + paramCount
    }
    if (clientId !== '*') {
      params.push(clientId)
      paramCount++
      sql += ' AND c.client_id = $' + paramCount
    }
    sql += ' ORDER BY client_id, clientname'
    const results = await pool.query(sql, params)
    return results.rows
  } catch (error) {
    throw error.message
  }
}

function getTenantPersonaClientRolesView () {
  return `SELECT t.iss_claim, t.name AS tenantname, p.sub_claim, p.user_context,
                c.client_id, c.name AS clientname,
                r.name AS rolename, r.description AS roledescription
            FROM usher.tenants t
            JOIN usher.tenantclients tc ON t.key = tc.tenantkey
            JOIN usher.clients c ON c.key = tc.clientkey
            JOIN usher.roles r ON r.clientkey = c.key
            JOIN usher.personaroles ur ON ur.rolekey = r.key
            JOIN usher.personas p ON ur.personakey = p.key AND p.tenantkey = t.key`
}

async function selectTenantPersonaClientRoles (subClaim = '*', userContext = '*', clientId = '*') {
  try {
    let sql = getTenantPersonaClientRolesView() + ' WHERE 1=1'
    const params = []
    let paramCount = 0
    if (subClaim !== '*') {
      params.push(subClaim)
      paramCount++
      sql += ' AND p.sub_claim = $' + paramCount
    }
    if (userContext !== '*') {
      params.push(userContext)
      paramCount++
      sql += ' AND p.user_context = $' + paramCount
    }
    if (clientId !== '*') {
      params.push(clientId)
      paramCount++
      sql += ' AND c.client_id = $' + paramCount
    }
    sql += ' ORDER BY tenantname, sub_claim, client_id, user_context, rolename'
    const results = await pool.query(sql, params)
    return results.rows
  } catch (error) {
    throw error.message
  }
}

async function selectClientsByTenantPersonaRole (subClaim = '*', userContext = '*', rolename = '*') {
  try {
    let sql = getTenantPersonaClientRolesView() + ' WHERE 1=1'
    const params = []
    let paramCount = 0
    if (subClaim !== '*') {
      params.push(subClaim)
      paramCount++
      sql += ' AND p.sub_claim = $' + paramCount
    }
    if (userContext !== '*') {
      params.push(userContext)
      paramCount++
      sql += ' AND p.user_context = $' + paramCount
    }
    // This is specifically set as LIKE to allow the generation of %:client-admin roles
    if (rolename !== '*') {
      params.push(rolename)
      paramCount++
      sql += ' AND r.name LIKE $' + paramCount
    }
    sql += ' ORDER BY tenantname, sub_claim, user_context, client_id, rolename'
    const results = await pool.query(sql, params)
    return results.rows
  } catch (error) {
    throw error.message
  }
}

function getTenantPersonaClientRolePermissionsView () {
  return `SELECT
    t.iss_claim,
    t.name AS tenantname,
    p.sub_claim,
    p.user_context,
    c.client_id,
    c.name AS clientname,
    r.name AS rolename,
    r.description AS roledescription,
    pm.name AS permissionname,
    pm.description AS permissiondescription
  FROM
    usher.tenants t
  JOIN
     usher.tenantclients tc
     ON t.key = tc.tenantkey
  JOIN
     usher.clients c
     ON c.key = tc.clientkey
  JOIN
     usher.personas p
     ON p.tenantkey = t.key
  JOIN
     usher.personaroles pr
     ON pr.personakey = p.key
  JOIN
     usher.roles r
     ON r.key = pr.rolekey
     and r.clientkey = c.key
  JOIN
     usher.rolepermissions rp
     ON rp.rolekey = r.key
  JOIN
     usher.permissions pm
     ON pm.key = rp.permissionkey
     AND (pm.clientkey IS NULL OR pm.clientkey = c.key)`
}

async function selectTenantPersonaClientRolePermissions (subClaim = '*', userContext = '*', clientId = '*') {
  try {
    let sql = getTenantPersonaClientRolePermissionsView() + ' WHERE 1=1'
    const params = []
    let paramCount = 0
    if (subClaim !== '*') {
      params.push(subClaim)
      paramCount++
      sql += ' AND p.sub_claim = $' + paramCount
    }
    if (userContext !== '*') {
      params.push(userContext)
      paramCount++
      sql += ' AND p.user_context = $' + paramCount
    }
    if (clientId !== '*') {
      params.push(clientId)
      paramCount++
      sql += ' AND c.client_id = $' + paramCount
    }
    sql += ' ORDER BY tenantname, sub_claim, user_context, client_id, rolename, permissionname'
    const results = await pool.query(sql, params)
    return results.rows
  } catch (error) {
    throw error.message
  }
}

function getTenantPersonaPermissionsView () {
  return `SELECT c.client_id, p.sub_claim, pm.name AS permissionname
            FROM usher.tenants t
            JOIN usher.tenantclients tc ON t.key = tc.tenantkey
            JOIN usher.clients c ON c.key = tc.clientkey
            JOIN usher.personas p ON p.tenantkey = tc.tenantkey
            JOIN usher.personapermissions pp ON p.key = pp.personakey
            JOIN usher.permissions pm ON (pp.permissionkey = pm.KEY AND pm.clientkey = c.key)`
}

async function selectTenantPersonaPermissions (clientId = '*', subClaim = '*') {
  try {
    let sql = getTenantPersonaPermissionsView() + ' WHERE 1=1'
    const params = []
    let paramCount = 0
    if (clientId !== '*') {
      params.push(clientId)
      paramCount++
      sql += ' AND c.client_id = $' + paramCount
    }
    if (subClaim !== '*') {
      params.push(subClaim)
      paramCount++
      sql += ' AND p.sub_claim = $' + paramCount
    }
    sql += ' ORDER BY client_id, sub_claim, permissionname'
    const results = await pool.query(sql, params)
    return results.rows
  } catch (error) {
    throw error.message
  }
}

function getClientRolesView () {
  return `SELECT c.client_id, c.name AS clientname, r.name AS rolename, r.description AS roledescription
            FROM usher.clients c
            JOIN usher.roles r ON r.clientkey = c.key`
}

async function selectClientRoles (clientId = '*', rolename = '*') {
  try {
    let sql = getClientRolesView() + ' WHERE 1=1'
    const params = []
    let paramCount = 0
    if (clientId !== '*') {
      params.push(clientId)
      paramCount++
      sql += ' AND c.client_id = $' + paramCount
    }
    if (rolename !== '*') {
      params.push(rolename)
      paramCount++
      sql += ' AND r.name = $' + paramCount
    }
    sql += ' ORDER BY client_id, rolename'
    const results = await pool.query(sql, params)
    return results.rows
  } catch (error) {
    throw error.message
  }
}

/**
 * Get a list of roles for a given sub claim (Persona).
 *
 * @param {string} subClaim The unique sub claim id to look up roles for
 * @param {string} userContext Optional user context for the given sub claim
 * @param {*} clientId
 * @returns
 */
async function selectSelfRoles (subClaim, userContext = '*', clientId = '*') {
  const params = [subClaim]
  let paramCount = 1
  let sql = `SELECT DISTINCT r.key, r.clientkey, r.name, r.description
  FROM usher.tenants t
  JOIN usher.tenantclients tc ON t.key = tc.tenantkey
  JOIN usher.clients c ON c.key = tc.clientkey
  JOIN usher.roles r ON r.clientkey = c.key
  JOIN usher.personaroles ur ON ur.rolekey = r.key
  JOIN usher.personas p ON ur.personakey = p.key AND p.tenantkey = t.key
  WHERE p.sub_claim = $1 `

  try {
    if (userContext !== '*') {
      params.push(userContext)
      paramCount++
      sql += ' AND p.user_context = $' + paramCount
    }
    if (clientId !== '*') {
      params.push(clientId)
      paramCount++
      sql += ' AND c.client_id = $' + paramCount
    }

    const results = await pool.query(sql, params)
    return results.rows
  } catch (error) {
    throw error.message
  }
}

async function selectSelfPermissions (subClaim = '*', userContext = '*', clientId = '*') {
  let sql = `SELECT DISTINCT pm.name AS permission
  FROM usher.tenants t
  JOIN usher.tenantclients tc ON t.key = tc.tenantkey
  JOIN usher.clients c ON c.key = tc.clientkey
  JOIN usher.roles r ON r.clientkey = c.key
  JOIN usher.personaroles ur ON ur.rolekey = r.key
  JOIN usher.personas p ON ur.personakey = p.key AND p.tenantkey = t.key
  JOIN usher.rolepermissions rp ON rp.rolekey = r.key
  JOIN usher.personaPermissions pp ON pp.personakey = p.key
  JOIN usher.permissions pm ON ((rp.permissionkey = pm.KEY OR pp.permissionkey = pm.KEY) AND pm.clientkey = c.key)
  WHERE 1=1`
  const params = []
  let paramCount = 0
  try {
    if (subClaim !== '*') {
      params.push(subClaim)
      paramCount++
      sql += ' AND p.sub_claim = $' + paramCount
    }
    if (userContext !== '*') {
      params.push(userContext)
      paramCount++
      sql += ' AND p.user_context = $' + paramCount
    }
    if (clientId !== '*') {
      params.push(clientId)
      paramCount++
      sql += ' AND c.client_id = $' + paramCount
    }

    const results = await pool.query(sql, params)
    return results.rows
  } catch (error) {
    throw error.message
  }
}

async function selectSelfScope (subClaim = '*', userContext = '*', clientId = '*') {
  let sql = `SELECT DISTINCT r.name as role, pm.name AS permission
  FROM usher.tenants t
  JOIN usher.tenantclients tc ON t.key = tc.tenantkey
  JOIN usher.clients c ON c.key = tc.clientkey
  JOIN usher.roles r ON r.clientkey = c.key
  JOIN usher.personaroles ur ON ur.rolekey = r.key
  JOIN usher.personas p ON ur.personakey = p.key AND p.tenantkey = t.key
  JOIN usher.rolepermissions rp ON rp.rolekey = r.key
  JOIN usher.personapermissions pp ON p.KEY = pp.personakey AND pm.KEY = pp.permissionkey
  JOIN usher.permissions pm ON ((rp.permissionkey = pm.KEY OR pp.permissionkey = pm.KEY) AND pm.clientkey = c.key)
  WHERE 1=1`
  const params = []
  let paramCount = 0
  try {
    if (subClaim !== '*') {
      params.push(subClaim)
      paramCount++
      sql += ' AND p.sub_claim = $' + paramCount
    }
    if (userContext !== '*') {
      params.push(userContext)
      paramCount++
      sql += ' AND p.user_context = $' + paramCount
    }
    if (clientId !== '*') {
      params.push(clientId)
      paramCount++
      sql += ' AND c.client_id = $' + paramCount
    }

    const results = await pool.query(sql, params)
    return results.rows
  } catch (error) {
    throw error.message
  }
}

/**
 * @deprecated
 * @returns
 */
function getClientRolePermissionsView () {
  return `SELECT DISTINCT c.client_id, c.name AS clientname, r.name AS rolename, r.description AS roledescription,
                pm.name AS permissionname, pm.description AS permissiondescription
            FROM usher.clients c
            JOIN usher.roles r ON r.clientkey = c.key
            JOIN usher.rolepermissions rp ON rp.rolekey = r.key
            JOIN usher.permissions pm ON
              rp.permissionkey = pm.key AND
              pm.clientkey = c.key AND
              pm.clientkey = r.clientkey`
}

/**
 * @deprecated
 * @param {*} clientId
 * @param {*} rolename
 * @returns
 */
async function selectClientRolePermissions (clientId = '*', rolename = '*') {
  try {
    let sql = getClientRolePermissionsView() + ' WHERE 1=1'
    const params = []
    let paramCount = 0
    if (clientId !== '*') {
      params.push(clientId)
      paramCount++
      sql += ' AND c.client_id = $' + paramCount
    }
    if (rolename !== '*') {
      params.push(rolename)
      paramCount++
      sql += ' AND r.name = $' + paramCount
    }
    sql += ' ORDER BY client_id, rolename, permissionname'
    const results = await pool.query(sql, params)
    return results.rows
  } catch (error) {
    throw error.message
  }
}

module.exports = {
  selectTenantPersonaClients,
  selectTenantPersonaClientRoles,
  selectClientsByTenantPersonaRole,
  selectTenantPersonaClientRolePermissions,
  selectTenantPersonaPermissions,
  selectSelfPermissions,
  selectSelfRoles,
  selectSelfScope,
  selectClientRoles,
  selectClientRolePermissions
}
