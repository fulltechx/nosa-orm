import { DatabaseAdapter } from '../adapters/DatabaseAdapter';
import { MongoDBAdapter } from '../adapters/MongoDBAdapter';
import { MySQLAdapter } from '../adapters/MySQLAdapter';
import { PostgresAdapter } from '../adapters/PostgresAdapter';

export enum DatabaseType {
  MONGODB = 'mongodb',
  MYSQL = 'mysql',
  POSTGRESQL = 'postgresql',
}

export class DatabaseAdapterFactory {
  public static createAdapter(
    type: DatabaseType,
    config: any,
  ): DatabaseAdapter {
    switch (type) {
      case DatabaseType.MONGODB:
        return new MongoDBAdapter(); // Configuration will be passed during connect()
      case DatabaseType.MYSQL:
        return new MySQLAdapter(); // Configuration will be passed during connect()
      case DatabaseType.POSTGRESQL:
        return new PostgresAdapter(); // Configuration will be passed during connect()
      default:
        throw new Error(`Unsupported database type: ${type}`);
    }
  }
}
