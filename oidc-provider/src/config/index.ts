import dotenv from 'dotenv';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

dotenv.config();

const port = parseInt(process.env.PORT || '3000', 10);

export default {
    port,
    production: process.env.NODE_ENV === 'production',
    api: {
        prefix: '/'
    },
    log: {
        level: process.env.LOG_LEVEL || 'silly'
    },
    provider: {
        issuer: process.env.PROVIDER_ISSUER || `http://localhost:${port}`,
        passwordGrant: {
            url: <string>process.env.PASSWORD_GRANT_LOGIN_URL,
            clientId: <string>process.env.PASSWORD_GRANT_LOGIN_CLIENT_ID,
            clientSecret: <string>process.env.PASSWORD_GRANT_LOGIN_CLIENT_SECRET
        }
    },
    db: {
        host: <string>process.env.DB_HOST,
        schema: <string>process.env.DB_SCHEMA || '',
        database: <string>process.env.DB_DATABASE,
        username: <string>process.env.DB_USERNAME,
        password: <string>process.env.DB_PASSWORD,
        port: <number> parseInt(process.env.DB_PORT || '5432', 10)
    }
};
