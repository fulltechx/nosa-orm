import { Client, Pool, PoolClient } from "pg"; // Client for single connection, Pool for pooling
import { DatabaseAdapter } from "./DatabaseAdapter";

// For now, we'll use Client for simplicity, Pool will be step 10
export class PostgresAdapter implements DatabaseAdapter {
    private client: Client | null = null;

    async connect(config: any): Promise<void> {
        // config should include host, user, password, database, port, etc.
        this.client = new Client(config);
        await this.client.connect();
        console.log("Connected to PostgreSQL database.");
    }

    async disconnect(): Promise<void> {
        if (this.client) {
            await this.client.end();
            this.client = null;
            console.log("Disconnected from PostgreSQL database.");
        }
    }

    async insert(tableName: string, data: any): Promise<any> {
        if (!this.client) throw new Error("Not connected to database");
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
        const sql = `INSERT INTO ${tableName} (${keys.join(", ")}) VALUES (${placeholders}) RETURNING id`; // Assuming 'id' is the PK

        const result = await this.client.query(sql, values);
        return result.rows[0]?.id; // Or handle cases where 'id' might not be returned or named differently
    }

    async find(tableName: string, criteria: any): Promise<any[]> {
        if (!this.client) throw new Error("Not connected to database");
        let sql = `SELECT * FROM ${tableName}`;
        const values: any[] = [];
        let paramIndex = 1;
        if (Object.keys(criteria).length > 0) {
            const whereClauses = Object.keys(criteria)
                .map((key) => {
                    const clause = `${key} = $${paramIndex++}`;
                    values.push(criteria[key]);
                    return clause;
                })
                .join(" AND ");
            sql += ` WHERE ${whereClauses}`;
        }
        const result = await this.client.query(sql, values);
        return result.rows;
    }

    async findOne(tableName: string, criteria: any): Promise<any | null> {
        if (!this.client) throw new Error("Not connected to database");
        let sql = `SELECT * FROM ${tableName}`;
        const values: any[] = [];
        let paramIndex = 1;
        if (Object.keys(criteria).length > 0) {
            const whereClauses = Object.keys(criteria)
                .map((key) => {
                    const clause = `${key} = $${paramIndex++}`;
                    values.push(criteria[key]);
                    return clause;
                })
                .join(" AND ");
            sql += ` WHERE ${whereClauses}`;
        }
        sql += ` LIMIT 1`;
        const result = await this.client.query(sql, values);
        return result.rows.length > 0 ? result.rows[0] : null;
    }

    async update(tableName: string, criteria: any, data: any): Promise<number> {
        if (!this.client) throw new Error("Not connected to database");
        const dataEntries = Object.entries(data);
        let paramIndex = 1;
        const setClauses = dataEntries.map(([key]) => `${key} = $${paramIndex++}`).join(", ");
        const dataValues = dataEntries.map(([, value]) => value);

        let sql = `UPDATE ${tableName} SET ${setClauses}`;
        const values: any[] = [...dataValues];

        if (Object.keys(criteria).length > 0) {
            const whereClauses = Object.keys(criteria)
                .map((key) => {
                    const clause = `${key} = $${paramIndex++}`;
                    values.push(criteria[key]);
                    return clause;
                })
                .join(" AND ");
            sql += ` WHERE ${whereClauses}`;
        }
        const result = await this.client.query(sql, values);
        return result.rowCount ?? 0;
    }

    async delete(tableName: string, criteria: any): Promise<number> {
        if (!this.client) throw new Error("Not connected to database");
        let sql = `DELETE FROM ${tableName}`;
        const values: any[] = [];
        let paramIndex = 1;
        if (Object.keys(criteria).length > 0) {
            const whereClauses = Object.keys(criteria)
                .map((key) => {
                    const clause = `${key} = $${paramIndex++}`;
                    values.push(criteria[key]);
                    return clause;
                })
                .join(" AND ");
            sql += ` WHERE ${whereClauses}`;
        }
        const result = await this.client.query(sql, values);
        return result.rowCount ?? 0;
    }

    async query(queryString: string, params?: any[]): Promise<any[]> {
        if (!this.client) throw new Error("Not connected to database");
        // pg library uses $1, $2 for placeholders in prepared statements
        const result = await this.client.query(queryString, params);
        return result.rows;
    }
}
