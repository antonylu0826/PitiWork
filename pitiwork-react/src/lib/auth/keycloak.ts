import Keycloak from 'keycloak-js';

// NOTE: You should move these configuration values to environment variables
// for better security and flexibility.
const keycloakConfig = {
  url: 'http://localhost:8080',
  realm: 'my-realm',
  clientId: 'react',

};

const keycloak = new Keycloak(keycloakConfig);

export default keycloak;
