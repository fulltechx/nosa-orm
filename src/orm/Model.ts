import { ORM } from "./ORM"; // ORM will be created in the next step
import { ObjectId } from "mongodb"; // For MongoDB _id type

// This is a forward declaration/type placeholder for the ORM
// The actual ORM instance will be injected or set statically
let ormInstance: ORM;

export function setORMInstance(orm: ORM) {
    ormInstance = orm;
}

export abstract class Model {
    static tableName: string; // To be overridden by subclasses
    [key: string]: any; // Allow dynamic properties for model fields

    constructor(data?: Partial<any>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    // Instance methods
    async save(): Promise<this> {
        if (!ormInstance) throw new Error("ORM instance not set on Model.");
        const constructor = this.constructor as typeof Model;
        if (this._id || this.id) {
            // Assuming common PK names _id (Mongo) or id (SQL)
            // Update existing record
            // Criteria for update needs to be defined, typically based on id
            const idField = this._id ? "_id" : "id";
            const idValue = this[idField];
            if (!idValue) throw new Error("Cannot update model without an ID.");
            await ormInstance.update(constructor, { [idField]: idValue }, this);
        } else {
            // Insert new record
            const savedData = await ormInstance.insert(constructor, this);
            // Assign returned data (e.g., generated ID) back to the instance
            Object.assign(this, savedData);
        }
        return this;
    }

    async remove(): Promise<number> {
        if (!ormInstance) throw new Error("ORM instance not set on Model.");
        const constructor = this.constructor as typeof Model;
        const idField = this._id ? "_id" : "id";
        const idValue = this[idField];
        if (!idValue) throw new Error("Cannot remove model without an ID.");
        return ormInstance.delete(constructor, { [idField]: idValue });
    }

    // Static methods for querying
    static async create<T extends Model>(
        this: new (data?: Partial<T>) => T,
        data: Partial<T>
    ): Promise<T> {
        if (!ormInstance) throw new Error("ORM instance not set on Model.");
        const instance = new this(data);
        await instance.save(); // save will handle insert and assign ID
        return instance;
    }

    static async findById<T extends Model>(
        this: new () => T,
        id: string | number | ObjectId
    ): Promise<T | null> {
        if (!ormInstance) throw new Error("ORM instance not set on Model.");
        // Assuming 'id' or '_id' is the primary key field name.
        // This might need to be more flexible or configurable in a full ORM.
        const Ctor = this as typeof Model;
        // Try finding by 'id' (common for SQL) or '_id' (common for MongoDB)
        // This is a simplification. A robust ORM might have explicit PK configuration.
        let result = await ormInstance.findOne(Ctor, { id: id });
        if ((!result && id instanceof ObjectId) || typeof id === "string") {
            // Check for MongoDB ObjectId specifically if first attempt fails
            result = await ormInstance.findOne(Ctor, { _id: id });
        }
        return result ? (new Ctor(result) as T) : null;
    }

    static async find<T extends Model>(
        this: new (data?: Partial<T>) => T,
        criteria: any
    ): Promise<T[]> {
        if (!ormInstance) throw new Error("ORM instance not set on Model.");
        const Ctor = this as typeof Model;
        const results = await ormInstance.find(Ctor, criteria);
        return results.map((data) => new this(data) as T);
    }

    static async findOne<T extends Model>(
        this: new (data?: Partial<T>) => T,
        criteria: any
    ): Promise<T | null> {
        if (!ormInstance) throw new Error("ORM instance not set on Model.");
        const Ctor = this as typeof Model;
        const result = await ormInstance.findOne(Ctor, criteria);
        return result ? (new this(result) as T) : null;
    }

    static async update<T extends Model>(
        this: new () => T,
        criteria: any,
        data: Partial<T>
    ): Promise<number> {
        if (!ormInstance) throw new Error("ORM instance not set on Model.");
        const Ctor = this as typeof Model;
        return ormInstance.update(Ctor, criteria, data);
    }

    static async delete<T extends Model>(this: new () => T, criteria: any): Promise<number> {
        if (!ormInstance) throw new Error("ORM instance not set on Model.");
        const Ctor = this as typeof Model;
        return ormInstance.delete(Ctor, criteria);
    }
}
