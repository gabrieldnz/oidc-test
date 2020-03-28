import Provider from "oidc-provider";

import Logger from '../config/logger';

import PasswordGrant from './password';

export default async (provider: Provider) => {
    Logger.debug('Starting Password grant registration');
    await PasswordGrant.register(provider);
    Logger.debug('Finished Password grant registration');
};
