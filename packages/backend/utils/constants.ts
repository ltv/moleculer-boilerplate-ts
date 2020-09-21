// SERVICES (S)
export const SVC_USER = 'user';
export const SVC_USER_DB = 'tbl-user';
export const SVC_INTERACTION = 'interaction';
export const SVC_NOTIFICATION = 'notification';
export const SVC_MAIL = 'mail';
export const SVC_PROJECT = 'project';
export const SVC_PROJECT_DB = 'tbl-project';
export const SVC_SEARCH = 'search';
export const SVC_TRANSACTION = 'transaction';
export const SVC_GATEWAY: string = 'gateway';
export const SVC_CONFIGS = 'configs';
export const SVC_AUTH = process.env.AUTH_SERVICE_NAME || 'v1.@auth-auth';
export const SVC_TOKEN = process.env.TOKEN_SERVICE_NAME || 'v1.@auth-token';
// SERVICES (E)

// ERROR TYPE (S)
export const ERR_EXT = 'ERROR EXISTING';
// ERROR TYPE (E)
