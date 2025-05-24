import * as AllExports from '../src'; // Imports from src/index.ts

describe('Library Exports', () => {
  it('should export ORM class', () => {
    expect(AllExports.ORM).toBeDefined();
  });

  it('should export Model class', () => {
    expect(AllExports.Model).toBeDefined();
  });
  
  it('should export setORMInstance function', () => {
    expect(AllExports.setORMInstance).toBeDefined();
  });

  it('should export DatabaseAdapterFactory class', () => {
    expect(AllExports.DatabaseAdapterFactory).toBeDefined();
  });

  it('should export DatabaseType enum', () => {
    expect(AllExports.DatabaseType).toBeDefined();
  });

  // DatabaseAdapter is an interface (type), so it won't exist as a value at runtime.
  // We can't directly test `expect(AllExports.DatabaseAdapter).toBeDefined();`
  // However, its implementing classes being defined is a good indirect check.
  // If needed, one could write a type-level test, but that's more complex.

  it('should export MongoDBAdapter class', () => {
    expect(AllExports.MongoDBAdapter).toBeDefined();
  });

  it('should export MySQLAdapter class', () => {
    expect(AllExports.MySQLAdapter).toBeDefined();
  });

  it('should export PostgresAdapter class', () => {
    expect(AllExports.PostgresAdapter).toBeDefined();
  });

  // Add this new test case
  it('should export RedisAdapter class', () => {
    expect(AllExports.RedisAdapter).toBeDefined();
  });

  // Verify a few specific enum values if necessary
  it('DatabaseType enum should have correct values', () => {
    expect(AllExports.DatabaseType.MONGODB).toEqual('mongodb');
    expect(AllExports.DatabaseType.MYSQL).toEqual('mysql');
    expect(AllExports.DatabaseType.POSTGRESQL).toEqual('postgresql');
    expect(AllExports.DatabaseType.REDIS).toEqual('redis'); // Add check for REDIS
  });
});
