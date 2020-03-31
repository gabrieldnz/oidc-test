import Provider from "oidc-provider";
import set from 'lodash/set';

import grants from '../grants';
import config from '../config';
import oidcConfig from '../config/oidc';
import adapter from "../adapters/postgres";


export default async () => {
// @ts-ignore FIXME
    const provider = new Provider(config.provider.issuer, {adapter, ...oidcConfig});

    await grants(provider);

    if (config.production) {
        provider.proxy = true;
        set(oidcConfig, 'cookies.short.secure', true);
        set(oidcConfig, 'cookies.long.secure', true);
    }

    return provider;
};
