import dotenv from 'dotenv';

import {Dialect} from "sequelize";

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

dotenv.config();

const port = parseInt(process.env.PORT || '3000', 10);

export default {
    port,
    api: {
        prefix: '/'
    },
    log: {
        level: process.env.LOG_LEVEL || 'silly'
    },
    provider: {
        issuer: process.env.PROVIDER_ISSUER || `http://localhost:${port}`,
        passwordGrantUserValidatorUrl: <string>process.env.PASSWORD_GRANT_USER_VALIDATION_URL
    },
    db: {
        host: <string>process.env.DB_HOST,
        database: <string>process.env.DB_DATABASE,
        username: <string>process.env.DB_USERNAME,
        password: <string>process.env.DB_PASSWORD,
        dialect: <Dialect>process.env.SEQUELIZE_DIALECT
    }
};
