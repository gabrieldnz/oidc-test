import Provider, {KoaContextWithOIDC} from "oidc-provider";
import axios from 'axios';
import {v4 as uuidv4} from 'uuid';

import config from '../config';

const {InvalidGrant} = require('oidc-provider/lib/helpers/errors');
const instance = require('oidc-provider/lib/helpers/weak_cache');

const grantType: string = 'password';
const parameters: string[] = ['username', 'password'];
const allowedDuplicateParameters: string[] = [];

const handler = async (ctx: KoaContextWithOIDC, next: () => Promise<void>): Promise<void> => {

    const params = ctx.oidc.params;
    const client = ctx.oidc.client;
    const grantId = uuidv4();

    if (!params || !client) {
        throw new InvalidGrant('invalid request');
    }

    if (!params.username) {
        throw new InvalidGrant('username is required');
    }

    if (!params.password) {
        throw new InvalidGrant('password is required');
    }

    let user = undefined;

    try {
        const response = await axios.post(config.provider.passwordGrantUserValidatorUrl, {
            clientId: client.clientId,
            username: params.username,
            password: params.password
        });

        user = response.data;
    } catch (e) {
        if (e.response.statusCode === 400) {
            e.response.body
        }
    }

    if (!user) {
        throw new InvalidGrant('Invalid password or username');
    }

    const {
        audiences
    } = instance(ctx.oidc.provider).configuration();

    ctx.oidc.entity('Account', user);

    const {
        AccessToken, RefreshToken
    } = ctx.oidc.provider;

    const at = new AccessToken({
        accountId: user.id,
        claims: undefined,
        client: client,
        expiresWithSession: false,
        grantId: grantId,
        gty: grantType,
        scope: user.scope,
        sessionUid: undefined,
        sid: undefined
    });

    at.setAudiences(await audiences(ctx, user.id, at, 'access_token'));

    ctx.oidc.entity('AccessToken', at);
    const accessToken = await at.save();

    const rt = new RefreshToken({
        accountId: user.id,
        acr: undefined,
        amr: undefined,
        authTime: Math.floor(Date.now() / 1000),
        claims: undefined,
        client: client,
        expiresWithSession: false,
        grantId: grantId,
        gty: grantType,
        nonce: undefined,
        resource: undefined,
        rotations: 0,
        scope: user.scope,
        sessionUid: undefined,
        sid: undefined
    });

    ctx.oidc.entity('RefreshToken', rt);
    const refreshToken = await rt.save();

    ctx.body = {
        access_token: accessToken,
        expires_in: at.expiration,
        refresh_token: refreshToken,
        token_type: at.tokenType,
    };

    return await next();
};

export default {
    register: async (provider: Provider) => {
        provider.registerGrantType(grantType, handler, parameters, allowedDuplicateParameters);
    }
}
