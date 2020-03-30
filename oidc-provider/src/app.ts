import express from 'express';

import Logger from './config/logger';
import loaders from "./loaders";

const shutdown = (event: string) => () => {
    Logger.info(`Server received signal to shutdown with event ${event}`);
    process.exit(0);
};

process.on('SIGTERM', shutdown('SIGTERM'))
    .on('SIGINT', shutdown('SIGINT'))
    .on('SIGHUP', shutdown('SIGHUP'))
    .on('uncaughtException', (er) => {
        Logger.info(`uncaughtException caught the error: ${er.message}`);
        throw er;
    })
    .on('exit', (code) => {
        Logger.info(`Node process exit with code ${code}`)
    });

async function startServer() {
    const app = express();

    await loaders(app);
}

startServer();
