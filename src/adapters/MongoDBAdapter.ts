import { MongoClient, Db, Collection, Filter, ObjectId } from "mongodb";
import { DatabaseAdapter } from "./DatabaseAdapter";

export class MongoDBAdapter implements DatabaseAdapter {
    private client: MongoClient | null = null;
    private db: Db | null = null;
    private dbName: string | null = null;

    async connect(config: { url: string; dbName: string }): Promise<void> {
        // config should include url (e.g., 'mongodb://localhost:27017') and dbName
        this.client = new MongoClient(config.url);
        await this.client.connect();
        this.dbName = config.dbName;
        this.db = this.client.db(config.dbName);
        console.log("Connected to MongoDB.");
    }

    async disconnect(): Promise<void> {
        if (this.client) {
            await this.client.close();
            this.client = null;
            this.db = null;
            console.log("Disconnected from MongoDB.");
        }
    }

    private getCollection(tableName: string): Collection {
        if (!this.db) throw new Error("Not connected to database");
        return this.db.collection(tableName);
    }

    async insert(collectionName: string, data: any): Promise<any> {
        const collection = this.getCollection(collectionName);
        // MongoDB adds _id automatically if not provided.
        // Ensure data doesn't have _id if you want MongoDB to generate it, or handle it if it's pre-defined.
        if (data._id && typeof data._id === "string") {
            data._id = new ObjectId(data._id);
        }
        const result = await collection.insertOne(data);
        return result.insertedId; // Returns the ObjectId
    }

    async find(collectionName: string, criteria: Filter<any>): Promise<any[]> {
        const collection = this.getCollection(collectionName);
        // Ensure criteria._id is converted to ObjectId if it's a string
        if (criteria._id && typeof criteria._id === "string") {
            criteria._id = new ObjectId(criteria._id);
        }
        return await collection.find(criteria).toArray();
    }

    async findOne(collectionName: string, criteria: Filter<any>): Promise<any | null> {
        const collection = this.getCollection(collectionName);
        if (criteria._id && typeof criteria._id === "string") {
            criteria._id = new ObjectId(criteria._id);
        }
        return await collection.findOne(criteria);
    }

    async update(collectionName: string, criteria: Filter<any>, data: any): Promise<number> {
        const collection = this.getCollection(collectionName);
        // Ensure criteria._id is converted to ObjectId if it's a string
        if (criteria._id && typeof criteria._id === "string") {
            criteria._id = new ObjectId(criteria._id);
        }
        // Prevent updating the _id field
        const { _id, ...updateData } = data;
        const result = await collection.updateMany(criteria, { $set: updateData });
        return result.modifiedCount;
    }

    async delete(collectionName: string, criteria: Filter<any>): Promise<number> {
        const collection = this.getCollection(collectionName);
        if (criteria._id && typeof criteria._id === "string") {
            criteria._id = new ObjectId(criteria._id);
        }
        const result = await collection.deleteMany(criteria);
        return result.deletedCount;
    }

    /**
     * For MongoDB, 'query' is less about a string and more about a structured query.
     * This implementation will expect a filter object, similar to `find`.
     * For more complex aggregations, a separate method or an extension might be needed.
     * The `params` argument is ignored for MongoDB in this basic setup.
     */
    async query(collectionName: string, filter: Filter<any>, params?: any): Promise<any[]> {
        // `params` can be used for options like sort, limit, skip in a more advanced version
        const collection = this.getCollection(collectionName);
        if (filter._id && typeof filter._id === "string") {
            filter._id = new ObjectId(filter._id);
        }
        // The DatabaseAdapter interface defines query as `query(queryString: string, params?: any[])`
        // We are interpreting `queryString` as `collectionName` and `params[0]` as filter for MongoDB.
        // This is a compromise. A cleaner way would be to have different query methods or a more abstract query builder.
        return await collection.find(filter, params).toArray();
    }
}
