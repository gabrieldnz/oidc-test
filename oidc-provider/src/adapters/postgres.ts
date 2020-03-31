/*
 * This is a very rough-edged example, the idea is to still work with the fact that oidc-provider
 * has a rather "dynamic" schema. This example postgresql, and all dynamic data
 * uses JSON fields. id is set to be the primary key, grantId should be additionaly indexed for
 * models where these fields are set (grantId-able models). userCode should be additionaly indexed
 * for DeviceCode model. uid should be additionaly indexed for Session model.
*/

// TODO melhorar conforme necessário
// TODO verificar alterações necessárias no schema e adicionar schema em 1 readme

import {Pool} from 'pg';

import config from '../config';

const pool = new Pool({
    user: config.db.username,
    host: config.db.host,
    database: config.db.database,
    password: config.db.password,
    port: config.db.port,
    min: 4,
    max: 12,
    idleTimeoutMillis: 600000
});

const grantable = new Set([
    'AccessToken',
    'AuthorizationCode',
    'RefreshToken',
    'DeviceCode',
]);

export default class PostgresAdapter {
    private tableName: String;
    private fullTableName: String;

    constructor(name: String) {
        name = name.replace(/(?:^|\.?)([A-Z])/g, function (x, y) {
            return "_" + y.toLowerCase()
        }).replace(/^_/, "");

        this.tableName = name;
        this.fullTableName = config.db.schema == "" ? this.tableName : config.db.schema + "." + this.tableName;
    }

    async upsert(id: any, data: any, expiresIn: any) {
        let updateColumnsAndValues: string = "data = $2, created_at = $3, updated_at = $3";
        let insertColumns: string = "id, data, created_at, updated_at";
        let insertValues: string = "$1, $2, $3, $3";
        let params = [
            id,
            data,
            new Date()
        ];

        if (data.grantId) {
            params.push(data.grantId);
            insertColumns += `, grant_id`;
            insertValues += `, $${params.length}`;
            updateColumnsAndValues += `, grant_id = $${params.length}`;
        }

        if (data.userCode) {
            params.push(data.userCode);
            insertColumns += `, user_code`;
            insertValues += `, $${params.length}`;
            updateColumnsAndValues += `, user_code = $${params.length}`;
        }

        if (data.uid) {
            params.push(data.uid);
            insertColumns += `, uid`;
            insertValues += `, $${params.length}`;
            updateColumnsAndValues += `, uid = $${params.length}`;
        }

        if (expiresIn) {
            params.push(new Date(Date.now() + (expiresIn * 1000)));
            insertColumns += `, expires_at`;
            insertValues += `, $${params.length}`;
            updateColumnsAndValues += `, expires_at = $${params.length}`;
        }

        const insertQuery = {
            text: `INSERT INTO ${this.fullTableName} (${insertColumns}) VALUES (${insertValues})`,
            values: params
        };

        const updateQuery = {
            text: `UPDATE ${this.fullTableName} SET ${updateColumnsAndValues} WHERE id = $1`,
            values: params
        };

        const client = await pool.connect();

        try {
            const updateResult = await client.query(updateQuery);

            if (updateResult.rowCount <= 0) {
                await client.query(insertQuery);
            }
        } finally {
            client.release();
        }
    }

    async find(id: any) {
        const client = await pool.connect();

        try {
            const result = await client.query(`select * from ${this.fullTableName} where id = $1`, [id]);
            const found = result.rows[0];

            if (!found) return undefined;

            return {
                ...found.data,
                ...(found.consumedAt ? {consumed: true} : undefined),
            };
        } finally {
            await client.release();
        }
    }

    async findByUserCode(userCode: any) {
        const client = await pool.connect();

        try {
            const result = await client.query(`select * from ${this.fullTableName} where user_code = $1`, [userCode]);
            const found = result.rows[0];

            if (!found) return undefined;
            return {
                ...found.data,
                ...(found.consumedAt ? {consumed: true} : undefined),
            };
        } finally {
            await client.release();
        }
    }

    async findByUid(uid: any) {
        const client = await pool.connect();

        try {
            const result = await client.query(`select * from ${this.fullTableName} where uid = $1`, [uid]);
            const found = result.rows[0];

            if (!found) return undefined;
            return {
                ...found.data,
                ...(found.consumedAt ? {consumed: true} : undefined),
            };
        } finally {
            await client.release();
        }
    }

    async destroy(id: any) {
        const client = await pool.connect();

        try {
            await client.query(`DELETE FROM ${this.fullTableName} WHERE id = $1`, [id]);
        } finally {
            await client.release();
        }
    }

    async consume(id: any) {
        const client = await pool.connect();

        try {
            await client.query(`UPDATE ${this.fullTableName} SET consumed_at = $2 WHERE id = $1`, [id, new Date()]);
        } finally {
            client.release();
        }
    }

    async revokeByGrantId(grantId: any) {
        const client = await pool.connect();

        try {
            await client.query(`DELETE FROM ${this.fullTableName} WHERE grant_id = $1`, [grantId]);
        } finally {
            await client.release();
        }
    }
}
