
const axios = require('axios');

const get = require('lodash/get');
const uidToGrantId = require('debug')('oidc-provider:uid');

const { InvalidGrant } = require('oidc-provider/lib/helpers/errors');
const presence = require('oidc-provider/lib/helpers/validate_presence');
const instance = require('oidc-provider/lib/helpers/weak_cache');
const checkPKCE = require('oidc-provider/lib/helpers/pkce');
const revokeGrant = require('oidc-provider/lib/helpers/revoke_grant');

const gty = 'password';

module.exports.handler = async function authorizationCodeHandler(ctx, next) {

    const params = ctx.oidc.params;
    const client = ctx.oidc.client;

    if (!params.username) {
        throw new InvalidGrant('username is required');
    }

    if (!params.password) {
        throw new InvalidGrant('password is required');
    }

    const response = await axios.post('http://localhost:8080/user', {
        username: params.username,
        password: params.password
    });

    const user = response.data;

    const {
        issueRefreshToken,
        audiences,
        conformIdTokenClaims,
        features: { userinfo, dPoP: { iatTolerance }, mTLS: { getCertificate } },
    } = instance(ctx.oidc.provider).configuration();

    console.log('x');

    // presence(ctx, 'code', 'redirect_uri');
    //
    // const code = await ctx.oidc.provider.AuthorizationCode.find(ctx.oidc.params.code, {
    //     ignoreExpiration: true,
    // });
    //
    // if (!code) {
    //     throw new InvalidGrant('authorization code not found');
    // }

    if (!user) {
        throw new InvalidGrant('invalid password or username');
    }
    //
    // uidToGrantId('switched from uid=%s to value of grantId=%s', ctx.oidc.uid, code.grantId);
    // ctx.oidc.uid = code.grantId;
    //
    // if (code.isExpired) {
    //     throw new InvalidGrant('authorization code is expired');
    // }
    //
    // checkPKCE(ctx.oidc.params.code_verifier, code.codeChallenge, code.codeChallengeMethod);
    //
    // let cert;
    // if (ctx.oidc.client.tlsClientCertificateBoundAccessTokens) {
    //     cert = getCertificate(ctx);
    //     if (!cert) {
    //         throw new InvalidGrant('mutual TLS client certificate not provided');
    //     }
    // }
    //
    // if (code.clientId !== ctx.oidc.client.clientId) {
    //     throw new InvalidGrant('authorization code client mismatch');
    // }
    //
    // if (code.redirectUri !== ctx.oidc.params.redirect_uri) {
    //     throw new InvalidGrant('authorization code redirect_uri mismatch');
    // }
    //
    // if (code.consumed) {
    //     await Promise.all([
    //         code.destroy(),
    //         revokeGrant(ctx.oidc.provider, ctx.oidc.client, code.grantId),
    //     ]);
    //     ctx.oidc.provider.emit('grant.revoked', ctx, code.grantId);
    //     throw new InvalidGrant('authorization code already consumed');
    // }
    //
    // await code.consume();
    //
    // ctx.oidc.entity('AuthorizationCode', code);
    //
    // const account = await ctx.oidc.provider.Account.findAccount(ctx, code.accountId, code);
    //
    // if (!account) {
    //     throw new InvalidGrant('authorization code invalid (referenced account not found)');
    // }
    // ctx.oidc.entity('Account', account);
    ctx.oidc.entity('Account', user);
    //
    // const {
    //     AccessToken, IdToken, RefreshToken, ReplayDetection,
    // } = ctx.oidc.provider;
    //
    // const at = new AccessToken({
    //     accountId: account.accountId,
    //     claims: code.claims,
    //     client: ctx.oidc.client,
    //     expiresWithSession: code.expiresWithSession,
    //     grantId: code.grantId,
    //     gty,
    //     scope: code.scope,
    //     sessionUid: code.sessionUid,
    //     sid: code.sid,
    // });
    const {
        AccessToken, IdToken, RefreshToken, ReplayDetection,
    } = ctx.oidc.provider;

    const at = new AccessToken({
        accountId: user.id,
        claims: null,
        client: ctx.oidc.client,
        expiresWithSession: false,
        grantId: 'grantId',
        gty,
        scope: 'profile',
        sessionUid: null,
        sid: null
    });
    //
    // if (ctx.oidc.client.tlsClientCertificateBoundAccessTokens) {
    //     at.setThumbprint('x5t', cert);
    // }

    const { dPoP } = ctx.oidc;

    if (dPoP) {
        const unique = await ReplayDetection.unique(
            ctx.oidc.client.clientId, dPoP.jti, dPoP.iat + iatTolerance,
        );

        ctx.assert(unique, new InvalidGrant('DPoP Token Replay detected'));

        at.setThumbprint('jkt', dPoP.jwk);
    }

    // at.setAudiences(await audiences(ctx, account.accountId, at, 'access_token'));
    at.setAudiences(await audiences(ctx, user.id, at, 'access_token'));

    ctx.oidc.entity('AccessToken', at);
    const accessToken = await at.save();

    // let refreshToken;
    // if (await issueRefreshToken(ctx, ctx.oidc.client, code)) {
    //     const rt = new RefreshToken({
    //         accountId: account.accountId,
    //         acr: code.acr,
    //         amr: code.amr,
    //         authTime: code.authTime,
    //         claims: code.claims,
    //         client: ctx.oidc.client,
    //         expiresWithSession: code.expiresWithSession,
    //         grantId: code.grantId,
    //         gty,
    //         nonce: code.nonce,
    //         resource: code.resource,
    //         rotations: 0,
    //         scope: code.scope,
    //         sessionUid: code.sessionUid,
    //         sid: code.sid,
    //     });
    //
    //     if (ctx.oidc.client.tokenEndpointAuthMethod === 'none') {
    //         if (at.jkt) {
    //             rt.jkt = at.jkt;
    //         }
    //
    //         if (ctx.oidc.client.tlsClientCertificateBoundAccessTokens) {
    //             rt.setThumbprint('x5t', cert);
    //         }
    //     }
    //
    //     ctx.oidc.entity('RefreshToken', rt);
    //     refreshToken = await rt.save();
    // }



    let refreshToken;
    if (true) {
        const rt = new RefreshToken({
            accountId: user.id,
            acr: null,
            amr: null,
            authTime: 999999999,
            claims: null,
            client: ctx.oidc.client,
            expiresWithSession: false,
            grantId: 'grantId',
            gty,
            nonce: null,
            resource: null,
            rotations: 0,
            scope: 'profile',
            sessionUid: null,
            sid: null
        });

        if (ctx.oidc.client.tokenEndpointAuthMethod === 'none') {
            if (at.jkt) {
                rt.jkt = at.jkt;
            }

            if (ctx.oidc.client.tlsClientCertificateBoundAccessTokens) {
                rt.setThumbprint('x5t', cert);
            }
        }

        ctx.oidc.entity('RefreshToken', rt);
        refreshToken = await rt.save();
    }

    //
    // let idToken;
    // if (code.scopes.has('openid')) {
    //     const claims = get(code, 'claims.id_token', {});
    //     const rejected = get(code, 'claims.rejected', []);
    //     const token = new IdToken({
    //         ...await account.claims('id_token', code.scope, claims, rejected),
    //         acr: code.acr,
    //         amr: code.amr,
    //         auth_time: code.authTime,
    //     }, { ctx });
    //
    //     if (conformIdTokenClaims && userinfo.enabled) {
    //         token.scope = 'openid';
    //     } else {
    //         token.scope = code.scope;
    //     }
    //
    //     token.mask = claims;
    //     token.rejected = rejected;
    //
    //     token.set('nonce', code.nonce);
    //     token.set('at_hash', accessToken);
    //     token.set('sid', code.sid);
    //
    //     idToken = await token.issue({ use: 'idtoken' });
    // }


    let idToken;
    if (false) {
        const claims = get(code, 'claims.id_token', {});
        const rejected = get(code, 'claims.rejected', []);
        const token = new IdToken({
            ...await account.claims('id_token', code.scope, claims, rejected),
            acr: code.acr,
            amr: code.amr,
            auth_time: code.authTime,
        }, { ctx });

        if (conformIdTokenClaims && userinfo.enabled) {
            token.scope = 'openid';
        } else {
            token.scope = code.scope;
        }

        token.mask = claims;
        token.rejected = rejected;

        token.set('nonce', code.nonce);
        token.set('at_hash', accessToken);
        token.set('sid', code.sid);

        idToken = await token.issue({ use: 'idtoken' });
    }




    ctx.body = {
        access_token: accessToken,
        expires_in: at.expiration,
        id_token: idToken,
        refresh_token: refreshToken,
        scope: 'profile',
        token_type: at.tokenType,
    };

    await next();
};

module.exports.parameters = new Set(['username', 'password']);
