/*
 * This is a very rough-edged example, the idea is to still work with the fact that oidc-provider
 * has a rather "dynamic" schema. This example uses sequelize with postgresql, and all dynamic data
 * uses JSON fields. id is set to be the primary key, grantId should be additionaly indexed for
 * models where these fields are set (grantId-able models). userCode should be additionaly indexed
 * for DeviceCode model. uid should be additionaly indexed for Session model. For sequelize
 * migrations @see https://github.com/Rogger794/node-oidc-provider/tree/examples/example/migrations/sequelize
*/

// TODO melhorar conforme necessário
// TODO verificar alterações necessárias no schema e adicionar schema em 1 readme

import {DataTypes, Sequelize} from 'sequelize';

import config from '../config';
import Logger from '../config/logger';

const sequelize = new Sequelize(config.db.database, config.db.username, config.db.password, {
    host: config.db.host,
    dialect: config.db.dialect,
    logging: (sql: string) => {
        Logger.debug(sql);
    }
});

const grantable = new Set([
    'AccessToken',
    'AuthorizationCode',
    'RefreshToken',
    'DeviceCode',
]);

const models = [
    'Session',
    'AccessToken',
    'AuthorizationCode',
    'RefreshToken',
    'DeviceCode',
    'ClientCredentials',
    'Client',
    'InitialAccessToken',
    'RegistrationAccessToken',
    'Interaction',
    'ReplayDetection',
    'PushedAuthorizationRequest',
].reduce((map, name) => {
    map.set(name, sequelize.define(name, {
        id: {type: DataTypes.STRING, primaryKey: true},
        ...(grantable.has(name) ? {grantId: {type: DataTypes.STRING}} : undefined),
        ...(name === 'DeviceCode' ? {userCode: {type: DataTypes.STRING}} : undefined),
        ...(name === 'Session' ? {uid: {type: DataTypes.STRING}} : undefined),
        data: {type: DataTypes.JSONB},
        expiresAt: {type: DataTypes.DATE},
        consumedAt: {type: DataTypes.DATE},
    }, {
        schema: 'oidc'
    }));

    return map;
}, new Map());

export default class SequelizeAdapter {
    private model: any | undefined;
    private name: String;

    constructor(name: String) {
        this.model = models.get(name);
        this.name = name;
    }

    async upsert(id: any, data: any, expiresIn: any) {
        await this.model.upsert({
            id,
            data,
            ...(data.grantId ? {grantId: data.grantId} : undefined),
            ...(data.userCode ? {userCode: data.userCode} : undefined),
            ...(data.uid ? {uid: data.uid} : undefined),
            ...(expiresIn ? {expiresAt: new Date(Date.now() + (expiresIn * 1000))} : undefined),
        });
    }

    async find(id: any) {
        const found = await this.model.findByPk(id);
        if (!found) return undefined;
        return {
            ...found.data,
            ...(found.consumedAt ? {consumed: true} : undefined),
        };
    }

    async findByUserCode(userCode: any) {
        const found = await this.model.findOne({where: {userCode}});
        if (!found) return undefined;
        return {
            ...found.data,
            ...(found.consumedAt ? {consumed: true} : undefined),
        };
    }

    async findByUid(uid: any) {
        const found = await this.model.findOne({where: {uid}});
        if (!found) return undefined;
        return {
            ...found.data,
            ...(found.consumedAt ? {consumed: true} : undefined),
        };
    }

    async destroy(id: any) {
        await this.model.destroy({where: {id}});
    }

    async consume(id: any) {
        await this.model.update({consumedAt: new Date()}, {where: {id}});
    }

    async revokeByGrantId(grantId: any) {
        await this.model.destroy({where: {grantId}});
    }
}
