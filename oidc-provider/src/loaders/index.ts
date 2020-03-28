import express from 'express';

import Logger from '../config/logger';

import expressLoader from './express';
import providerLoader from './provider';

export default async (expressApp: express.Application) => {
    Logger.debug('Starting OIDC Provider configuration');
    const provider = await providerLoader();
    Logger.debug('Finished OIDC Provider configuration');

    Logger.debug('Starting Express configuration');
    await expressLoader(expressApp, provider);
    Logger.debug('Finished Express configuration');
};
