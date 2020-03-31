import express from 'express';
import Provider from "oidc-provider";
import bodyParser from 'body-parser';
import helmet from "helmet";
import url from 'url';

import routes from '../api';
import config from '../config';
import Logger from '../config/logger';
import RequestLogger from "../config/request-logger";

const packageData = require('../../package.json');

export default async (app: express.Application, provider: Provider) => {

    // Useful if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
    // It shows the real origin IP in the heroku or Cloudwatch logs
    app.enable('trust proxy');

    app.set('Json spaces', 4);

    app.use(RequestLogger);
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());

    app.use(helmet());

    /// error handlers
    app.use((err: any, req: any, res: any, next: any) => {
        res.status(err.status || 500);
        res.json({
            errors: {
                message: err.message,
            },
        });
    });

    if (config.production) {
        app.enable('trust proxy');

        app.use((req, res, next) => {
            if (req.secure) {
                next();
            } else if (req.method === 'GET' || req.method === 'HEAD') {
                res.redirect(url.format({
                    protocol: 'https',
                    host: req.get('host'),
                    pathname: req.originalUrl,
                }));
            } else {
                res.status(400).json({
                    error: 'invalid_request',
                    error_description: 'do yourself a favor and only use https',
                });
            }
        });
    }

    app.use(config.api.prefix, routes(provider));

    app.listen(config.port, err => {
        if (err) {
            Logger.error(err);
            process.exit(1);
            return;
        }

        const message = "\n------------------------------------------------------------------\n" +
            `${packageData.name} - Version: ${packageData.version}\n` +
            "------------------------------------------------------------------\n" +
            `Express server listening on port: ${config.port}\n` +
            "------------------------------------------------------------------";
        Logger.info(message);
    });
};
