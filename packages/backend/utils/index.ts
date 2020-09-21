export * from './jwt';

export function getOriginEnv() {
  const { CORS_ORIGINS } = process.env;
  if (!CORS_ORIGINS || ['true', 'false', true, false].indexOf(CORS_ORIGINS) !== -1) {
    return CORS_ORIGINS == 'true';
  }
  return CORS_ORIGINS.replace(/\s+/, '').split(',');
}
