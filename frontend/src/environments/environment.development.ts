export interface Environment {
  production: boolean;
  apiUrl: string;
  googleClientId: string;
  sentryDsn: string;
}

export const environment: Environment = {
  production: false,
  apiUrl: 'http://localhost:8081/api',
  googleClientId: 'GOOGLE_CLIENT_ID_PLACEHOLDER',
  sentryDsn: 'SENTRY_DSN_PLACEHOLDER',
};
