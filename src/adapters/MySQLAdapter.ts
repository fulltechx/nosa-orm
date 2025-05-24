import { createConnection, Connection } from "mysql2/promise";
import { DatabaseAdapter } from "./DatabaseAdapter";

export class MySQLAdapter implements DatabaseAdapter {
    private connection: Connection | null = null;

    async connect(config: any): Promise<void> {
        // config should include host, user, password, database, etc.
        this.connection = await createConnection(config);
        console.log("Connected to MySQL database.");
    }

    async disconnect(): Promise<void> {
        if (this.connection) {
            await this.connection.end();
            this.connection = null;
            console.log("Disconnected from MySQL database.");
        }
    }

    async insert(tableName: string, data: any): Promise<any> {
        if (!this.connection) throw new Error("Not connected to database");
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map(() => "?").join(", ");
        const sql = `INSERT INTO ${tableName} (${keys.join(", ")}) VALUES (${placeholders})`;
        const [result]: any = await this.connection.execute(sql, values);
        return result.insertId;
    }

    async find(tableName: string, criteria: any): Promise<any[]> {
        if (!this.connection) throw new Error("Not connected to database");
        let sql = `SELECT * FROM ${tableName}`;
        const values: any[] = [];
        if (Object.keys(criteria).length > 0) {
            const whereClauses = Object.keys(criteria)
                .map((key) => `${key} = ?`)
                .join(" AND ");
            sql += ` WHERE ${whereClauses}`;
            values.push(...Object.values(criteria));
        }
        const [rows] = await this.connection.execute(sql, values);
        return rows as any[];
    }

    async findOne(tableName: string, criteria: any): Promise<any | null> {
        if (!this.connection) throw new Error("Not connected to database");
        let sql = `SELECT * FROM ${tableName}`;
        const values: any[] = [];
        if (Object.keys(criteria).length > 0) {
            const whereClauses = Object.keys(criteria)
                .map((key) => `${key} = ?`)
                .join(" AND ");
            sql += ` WHERE ${whereClauses}`;
            values.push(...Object.values(criteria));
        }
        sql += ` LIMIT 1`;
        const [rows]: any = await this.connection.execute(sql, values);
        return rows.length > 0 ? rows[0] : null;
    }

    async update(tableName: string, criteria: any, data: any): Promise<number> {
        if (!this.connection) throw new Error("Not connected to database");
        const dataEntries = Object.entries(data);
        const setClauses = dataEntries.map(([key]) => `${key} = ?`).join(", ");
        const dataValues = dataEntries.map(([, value]) => value);

        let sql = `UPDATE ${tableName} SET ${setClauses}`;
        const values: any[] = [...dataValues];

        if (Object.keys(criteria).length > 0) {
            const whereClauses = Object.keys(criteria)
                .map((key) => `${key} = ?`)
                .join(" AND ");
            sql += ` WHERE ${whereClauses}`;
            values.push(...Object.values(criteria));
        }
        const [result]: any = await this.connection.execute(sql, values);
        return result.affectedRows;
    }

    async delete(tableName: string, criteria: any): Promise<number> {
        if (!this.connection) throw new Error("Not connected to database");
        let sql = `DELETE FROM ${tableName}`;
        const values: any[] = [];
        if (Object.keys(criteria).length > 0) {
            const whereClauses = Object.keys(criteria)
                .map((key) => `${key} = ?`)
                .join(" AND ");
            sql += ` WHERE ${whereClauses}`;
            values.push(...Object.values(criteria));
        }
        const [result]: any = await this.connection.execute(sql, values);
        return result.affectedRows;
    }

    async query(queryString: string, params?: any[]): Promise<any[]> {
        if (!this.connection) throw new Error("Not connected to database");
        const [rows] = await this.connection.execute(queryString, params);
        return rows as any[];
    }
}
