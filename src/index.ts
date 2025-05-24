// ORM Core
export { ORM } from './orm/ORM';
export { Model, setORMInstance } from './orm/Model'; // Assuming setORMInstance is something to be exposed

// Factory
export { DatabaseAdapterFactory, DatabaseType } from './factories/DatabaseAdapterFactory';

// Adapters Interface
export type { DatabaseAdapter } from './adapters/DatabaseAdapter'; // Exporting type for interface

// Concrete Adapters
export { MongoDBAdapter } from './adapters/MongoDBAdapter';
export { MySQLAdapter } from './adapters/MySQLAdapter';
export { PostgresAdapter } from './adapters/PostgresAdapter';
export { RedisAdapter } from './adapters/RedisAdapter';

// It's also common to export everything from a module if needed
// export * from './orm/ORM';
// export * from './orm/Model';
// etc.
// For now, explicit exports are clearer.
