import { DatabaseAdapterFactory, DatabaseType } from '../../src/factories/DatabaseAdapterFactory';
import { DatabaseAdapter } from '../../src/adapters/DatabaseAdapter';
import { MongoDBAdapter } from '../../src/adapters/MongoDBAdapter';
import { MySQLAdapter } from '../../src/adapters/MySQLAdapter';
import { PostgresAdapter } from '../../src/adapters/PostgresAdapter';
import { RedisAdapter } from '../../src/adapters/RedisAdapter'; // Import RedisAdapter

describe('DatabaseAdapterFactory', () => {
  // Mock config, not strictly needed for factory createAdapter as config is passed to connect later
  const mockConfig = {}; // This can be an empty object as adapters expect config in connect()

  it('should create a MongoDBAdapter for MONGODB type', () => {
    const adapter = DatabaseAdapterFactory.createAdapter(DatabaseType.MONGODB, mockConfig);
    expect(adapter).toBeInstanceOf(MongoDBAdapter);
    expect(adapter).toBeInstanceOf(DatabaseAdapter);
  });

  it('should create a MySQLAdapter for MYSQL type', () => {
    const adapter = DatabaseAdapterFactory.createAdapter(DatabaseType.MYSQL, mockConfig);
    expect(adapter).toBeInstanceOf(MySQLAdapter);
    expect(adapter).toBeInstanceOf(DatabaseAdapter);
  });

  it('should create a PostgresAdapter for POSTGRESQL type', () => {
    const adapter = DatabaseAdapterFactory.createAdapter(DatabaseType.POSTGRESQL, mockConfig);
    expect(adapter).toBeInstanceOf(PostgresAdapter);
    expect(adapter).toBeInstanceOf(DatabaseAdapter);
  });

  // Add this new test case for RedisAdapter
  it('should create a RedisAdapter for REDIS type', () => {
    const adapter = DatabaseAdapterFactory.createAdapter(DatabaseType.REDIS, mockConfig);
    expect(adapter).toBeInstanceOf(RedisAdapter);
    expect(adapter).toBeInstanceOf(DatabaseAdapter);
  });

  it('should throw an error for an unsupported database type', () => {
    const unsupportedType = 'UNSUPPORTED_DB_TYPE' as DatabaseType; // Cast for testing
    // The error message now includes the unsupported type value due to exhaustiveCheck logic
    expect(() => {
      DatabaseAdapterFactory.createAdapter(unsupportedType, mockConfig);
    }).toThrowError(`Unsupported database type: ${unsupportedType}`); 
    // If the factory's default case doesn't use the exhaustiveCheck variable in the error string, 
    // adjust the expected error message accordingly.
    // The current factory implementation uses: `throw new Error(\`Unsupported database type: \${exhaustiveCheck}\`);`
    // So, this test should be correct.
  });

  it('should throw an error if the type is null or undefined', () => {
    // The error message might change slightly if the exhaustiveCheck logic affects how null/undefined are stringified.
    // Current factory: `throw new Error(\`Unsupported database type: \${exhaustiveCheck}\`);`
    // When type is null, exhaustiveCheck is null. Error: "Unsupported database type: null"
    // When type is undefined, exhaustiveCheck is undefined. Error: "Unsupported database type: undefined"
    expect(() => {
      DatabaseAdapterFactory.createAdapter(null as any, mockConfig);
    }).toThrowError('Unsupported database type: null');
    
    expect(() => {
      DatabaseAdapterFactory.createAdapter(undefined as any, mockConfig);
    }).toThrowError('Unsupported database type: undefined');
  });
});
