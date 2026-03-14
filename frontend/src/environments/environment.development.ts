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
  sentryDsn:
    'https://de18f217e92ee8cbd7c8fb07293763d0@o4511023128182784.ingest.us.sentry.io/4511023134277632',
};
