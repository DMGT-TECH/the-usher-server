# The Usher

## Data Model

The following entity relationship diagram provides a high level view of The Usher's data model.

![Entity Relationship Diagram](../diagrams/the_usher_entity_relationship_diagram.png)

## Bootstrap Database with Seed Information

To use The Usher, some initial information needs to be loaded into the Usher's database in order for the Usher to be configured and start up correctly. The table below lists the tables that need to be populated, and describes what data to populate it with.

| Object | Description | Table | Attributes |
|-|-|-|-|
| Tenant | The tenant that will be issuing JWT Authentication tokens | tenants | name: Unique name for Tenant iss_claim:  iss value as url jwks_uri: jwks URI |
| Usher Client | Client representing the Usher application itself | clients | client_id: `the-usher` name: `The Usher` description: `This Resource Authorization Server` secret: Secret string used for generating JWT Authorization tokens |
| Usher Admin Role | Admin role to allow administering full access to Usher system and APIs. **NOTE**: The name value must match this value | roles | clientkey: clients.key foreign key reference name: `the-usher:usher-admin` description: `Admin for the Usher` |
| Usher Tenant Admin Role | Admin role to allow administering Tenant information. **NOTE**: The name value must match this value | roles | name: `the-usher:tenant-admin` description: `Admin for the tenant` |
| First Persona (User) | This is the first User that will be able to access the Usher. Configure as Usher Admin. **NOTE**: example sub claim from Auth0 JWT token is:  `auth0\|3e432b2d8a913e0e26328274` | personas | tenantkey: tenants.key foreign key to Tenant sub_claim: sub value from Authentication provider. user_context: Can leave blank.  |
| Persona Role Join | Associate First Persona to Usher Admin Role | personaroles | personakey: personas.key foreign key for First Persona rolekey: roles.key foreign key for Usher Admin |
| Tenant Client Join | Associate Usher Client with Tenant | tenantclients | tenantkey: tenants.key foreign key for Tenant clientkey: clients.key foreign key for Usher Client |

For more detail, see [database/init/load_sample_data.js](../database/init/load_sample_data.js)
