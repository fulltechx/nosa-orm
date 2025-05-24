import { DatabaseAdapter } from "../adapters/DatabaseAdapter";
import { MongoDBAdapter } from "../adapters/MongoDBAdapter";
import { MySQLAdapter } from "../adapters/MySQLAdapter";
import { PostgresAdapter } from "../adapters/PostgresAdapter";
import { RedisAdapter } from "../adapters/RedisAdapter"; // Import RedisAdapter

export enum DatabaseType {
    MONGODB = "mongodb",
    MYSQL = "mysql",
    POSTGRESQL = "postgresql",
    REDIS = "redis",
}

export class DatabaseAdapterFactory {
    public static createAdapter(
        type: DatabaseType,
        config: any // Config is primarily for the connect method of the adapter
    ): DatabaseAdapter {
        switch (type) {
            case DatabaseType.MONGODB:
                return new MongoDBAdapter();
            case DatabaseType.MYSQL:
                return new MySQLAdapter();
            case DatabaseType.POSTGRESQL:
                return new PostgresAdapter();
            case DatabaseType.REDIS: // Added this case
                return new RedisAdapter();
            default:
                // Ensure 'never' type for exhaustive check if possible, or robust default
                const exhaustiveCheck: never = type;
                throw new Error(`Unsupported database type: ${exhaustiveCheck}`);
        }
    }
}
