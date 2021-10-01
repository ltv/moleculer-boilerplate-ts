export function getCORSFromEnv(): boolean | string[] {
  const { CORS_ORIGIN } = process.env
  if (!CORS_ORIGIN || ['true', 'false', true, false].indexOf(CORS_ORIGIN) !== -1) {
    return CORS_ORIGIN == 'true'
  }
  return CORS_ORIGIN.replace(/\s+/, '').split(',')
}
