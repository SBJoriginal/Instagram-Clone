export interface Environment {
  production: boolean;
  apiUrl: string;
  googleClientId: string;
  sentryDsn: string;
  gaMeasurementId: string;
}

export const environment: Environment = {
  production: true,
  apiUrl: '/api',
  googleClientId: 'GOOGLE_CLIENT_ID_PLACEHOLDER',
  sentryDsn: 'SENTRY_DSN_PLACEHOLDER',
  gaMeasurementId: 'G-YJLH8DQV9T',
};
