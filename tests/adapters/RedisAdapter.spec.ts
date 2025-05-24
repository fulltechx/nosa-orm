import { RedisAdapter } from '../../src/adapters/RedisAdapter';
// DatabaseAdapter might not be needed directly in tests unless for type casting
// import { DatabaseAdapter } from '../../src/adapters/DatabaseAdapter'; 
import { v4 as uuidv4 } from 'uuid';

describe('RedisAdapter Integration Tests', () => {
  let adapter: RedisAdapter;
  const redisConfig = { url: process.env.TEST_REDIS_URL || 'redis://localhost:6379' };
  const testKeyPrefix = 'test_items_crud'; // Use a distinct prefix for these tests
  let testItemId: string; // To store ID of item created in one test and used in another

  beforeAll(async () => {
    // One-time setup: connect and potentially clean the prefix
    adapter = new RedisAdapter();
    await adapter.connect(redisConfig);
    // Initial cleanup for the specific prefix (safer than FLUSHDB)
    // This requires direct client access or a helper method.
    // For now, assuming direct client access for cleanup if possible.
    // This is a simplified representation of cleanup.
    const client = (adapter as any).client; // Accessing private client for test cleanup
    if (client) {
      const keys = await client.keys(`${testKeyPrefix}:*`);
      if (keys.length > 0) await client.del(keys);
    }
  });

  afterAll(async () => {
    // Final cleanup and disconnect
    const client = (adapter as any).client;
    if (client) {
      const keys = await client.keys(`${testKeyPrefix}:*`);
      if (keys.length > 0) await client.del(keys);
    }
    if (adapter) {
      await adapter.disconnect();
    }
  });
  
  // Removed beforeEach/afterEach in favor of beforeAll/afterAll for this test structure
  // to allow data to persist between specific tests (e.g. insert then findOne).

  it('should connect to Redis (covered by beforeAll)', () => {
    expect(adapter).toBeInstanceOf(RedisAdapter);
    // We need a way to check if client.isOpen or similar is true
    // For now, we assume connection if beforeAll didn't throw.
    const client = (adapter as any).client;
    expect(client?.isOpen).toBe(true); // Check if client is connected
  });

  it('should insert an item and return an ID', async () => {
    const testData = { name: 'Test Item 1', value: 100 };
    testItemId = await adapter.insert(testKeyPrefix, testData); // Store ID for later tests
    expect(testItemId).toBeDefined();
  });
  
  it('should insert an item with a pre-defined ID', async () => {
    const predefinedId = uuidv4();
    const testData = { id: predefinedId, name: 'Test Item Predefined', value: 456 };
    const returnedId = await adapter.insert(testKeyPrefix, testData);
    expect(returnedId).toEqual(predefinedId);
    // No need to store this ID globally as it's self-contained
  });

  it('should find a single item by ID (findOne)', async () => {
    // This test depends on the 'insert' test above having run and set testItemId
    expect(testItemId).toBeDefined(); // Ensure testItemId is set
    const item = await adapter.findOne(testKeyPrefix, { id: testItemId });
    expect(item).not.toBeNull();
    expect(item.id).toEqual(testItemId);
    expect(item.name).toEqual('Test Item 1'); // From the first insert test
  });

  it('should return null if findOne does not find an item by ID', async () => {
    const nonExistentId = uuidv4();
    const item = await adapter.findOne(testKeyPrefix, { id: nonExistentId });
    expect(item).toBeNull();
  });

  it('should find multiple items (find)', async () => {
    // Insert a couple more items for find test
    const item2Id = uuidv4();
    await adapter.insert(testKeyPrefix, { id: item2Id, name: 'Test Item 2', category: 'A' });
    await adapter.insert(testKeyPrefix, { id: uuidv4(), name: 'Another Item', category: 'B' }); // Will be found by prefix
    
    const allItems = await adapter.find(testKeyPrefix, {});
    // Expect at least 3 items: testItemId, item2Id, and the predefinedId one, plus 'Another Item'
    expect(allItems.length).toBeGreaterThanOrEqual(3); 
    expect(allItems.some(item => item.id === testItemId)).toBe(true);
    expect(allItems.some(item => item.id === item2Id)).toBe(true);

    // Test find with criteria (client-side filtering)
    const categoryAItems = await adapter.find(testKeyPrefix, { category: 'A' });
    expect(categoryAItems.length).toBeGreaterThanOrEqual(1);
    expect(categoryAItems.every(item => item.category === 'A')).toBe(true);
    expect(categoryAItems.some(item => item.id === item2Id)).toBe(true);
  });
  
  it('should update an existing item by ID (update)', async () => {
    expect(testItemId).toBeDefined();
    const updatedName = 'Updated Test Item 1';
    const updateResult = await adapter.update(testKeyPrefix, { id: testItemId }, { name: updatedName, value: 101 });
    expect(updateResult).toEqual(1); // 1 record updated

    const updatedItem = await adapter.findOne(testKeyPrefix, { id: testItemId });
    expect(updatedItem).not.toBeNull();
    expect(updatedItem!.name).toEqual(updatedName);
    expect(updatedItem!.value).toEqual(101);
  });

  it('should return 0 if update targets a non-existent ID', async () => {
    const nonExistentId = uuidv4();
    const updateResult = await adapter.update(testKeyPrefix, { id: nonExistentId }, { name: 'Non Existent' });
    expect(updateResult).toEqual(0);
  });

  it('should delete an item by ID (delete)', async () => {
    expect(testItemId).toBeDefined();
    const deleteResult = await adapter.delete(testKeyPrefix, { id: testItemId });
    expect(deleteResult).toEqual(1); // 1 record deleted

    const deletedItem = await adapter.findOne(testKeyPrefix, { id: testItemId });
    expect(deletedItem).toBeNull();
  });

  it('should return 0 if delete targets a non-existent ID', async () => {
    const nonExistentId = uuidv4();
    const deleteResult = await adapter.delete(testKeyPrefix, { id: nonExistentId });
    expect(deleteResult).toEqual(0);
  });

  it('should throw error for findOne if id is not in criteria', async () => {
    await expect(adapter.findOne(testKeyPrefix, { name: 'some name' }))
      .rejects.toThrow('findOne in RedisAdapter requires an "id" in criteria for direct lookup.');
  });

  it('should throw error for update if id is not in criteria', async () => {
    await expect(adapter.update(testKeyPrefix, { name: 'some name' }, { value: 1 }))
      .rejects.toThrow('Update in RedisAdapter requires an "id" in criteria.');
  });

  it('should throw error for delete if id is not in criteria', async () => {
    await expect(adapter.delete(testKeyPrefix, { name: 'some name' }))
      .rejects.toThrow('Delete in RedisAdapter requires an "id" in criteria.');
  });

});
