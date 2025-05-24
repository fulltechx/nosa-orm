import { DatabaseAdapterFactory, DatabaseType } from '../../src/factories/DatabaseAdapterFactory';
import { DatabaseAdapter } from '../../src/adapters/DatabaseAdapter';
import { MongoDBAdapter } from '../../src/adapters/MongoDBAdapter';
import { MySQLAdapter } from '../../src/adapters/MySQLAdapter';
import { PostgresAdapter } from '../../src/adapters/PostgresAdapter';

describe('DatabaseAdapterFactory', () => {
  // Mock config, not strictly needed for factory createAdapter as config is passed to connect later
  const mockConfig = {};

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

  it('should throw an error for an unsupported database type', () => {
    const unsupportedType = 'UNSUPPORTED_DB_TYPE' as DatabaseType; // Cast for testing
    expect(() => {
      DatabaseAdapterFactory.createAdapter(unsupportedType, mockConfig);
    }).toThrowError(`Unsupported database type: ${unsupportedType}`);
  });

  it('should throw an error if the type is null or undefined', () => {
    expect(() => {
      DatabaseAdapterFactory.createAdapter(null as any, mockConfig);
    }).toThrowError('Unsupported database type: null');
    
    expect(() => {
      DatabaseAdapterFactory.createAdapter(undefined as any, mockConfig);
    }).toThrowError('Unsupported database type: undefined');
  });
});
