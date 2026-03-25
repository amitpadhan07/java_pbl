import { Collection, ObjectId } from 'mongodb';
import { getCollection } from '@/lib/mongodb';
import { User } from '@/lib/models/entities';

/**
 * Abstract BaseRepository - Foundation for all repository classes
 * Implements Repository Pattern (Data Access Layer)
 * Principle: Abstraction and Encapsulation
 */
export abstract class BaseRepository<T> {
  protected collection: Collection | null = null;
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  protected async getCollection(): Promise<Collection> {
    if (!this.collection) {
      this.collection = await getCollection(this.collectionName);
    }
    return this.collection;
  }

  async create(document: any): Promise<T> {
    const collection = await this.getCollection();
    const result = await collection.insertOne(document);
    return { ...document, _id: result.insertedId } as T;
  }

  async findById(id: ObjectId): Promise<T | null> {
    const collection = await this.getCollection();
    return (await collection.findOne({ _id: id })) as T | null;
  }

  async findAll(): Promise<T[]> {
    const collection = await this.getCollection();
    return (await collection.find({}).toArray()) as T[];
  }

  async update(id: ObjectId, document: Partial<any>): Promise<T | null> {
    const collection = await this.getCollection();
    const result = await collection.findOneAndUpdate(
      { _id: id },
      { $set: { ...document, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    return ((result as any)?.value ?? result) as T | null;
  }

  async delete(id: ObjectId): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  async deleteAll(): Promise<number> {
    const collection = await this.getCollection();
    const result = await collection.deleteMany({});
    return result.deletedCount;
  }
}

/**
 * UserRepository - DAO for User entity
 * Specific database operations for Users
 */
export class UserRepository extends BaseRepository<User> {
  constructor() {
    super('users');
  }

  async findByEmail(email: string): Promise<User | null> {
    const collection = await this.getCollection();
    return (await collection.findOne({ email })) as User | null;
  }

  async updateUserPreferences(
    userId: ObjectId,
    preferences: any
  ): Promise<User | null> {
    const collection = await this.getCollection();
    const result = await collection.findOneAndUpdate(
      { _id: userId },
      { $set: { preferences, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    return ((result as any)?.value ?? result) as User | null;
  }

  async updateUserLocation(
    userId: ObjectId,
    location: string
  ): Promise<User | null> {
    const collection = await this.getCollection();
    const result = await collection.findOneAndUpdate(
      { _id: userId },
      { $set: { location, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    return ((result as any)?.value ?? result) as User | null;
  }
}

/**
 * ActivityRepository - DAO for Activity entity
 * Specific database operations for Activities
 */
export class ActivityRepository extends BaseRepository<any> {
  constructor() {
    super('activities');
  }

  async findByUserId(userId: ObjectId): Promise<any[]> {
    const collection = await this.getCollection();
    return (await collection
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray()) as any[];
  }

  async findByUserIdAndType(userId: ObjectId, activityType: string): Promise<any[]> {
    const collection = await this.getCollection();
    return (await collection
      .find({ userId, activityType })
      .sort({ createdAt: -1 })
      .toArray()) as any[];
  }

  async findByUserIdAndDateRange(
    userId: ObjectId,
    startDate: Date,
    endDate: Date
  ): Promise<any[]> {
    const collection = await this.getCollection();
    return (await collection
      .find({
        userId,
        createdAt: { $gte: startDate, $lt: endDate },
      })
      .sort({ createdAt: -1 })
      .toArray()) as any[];
  }

  async getMonthlyStats(userId: ObjectId, month: Date): Promise<{
    total: number;
    transport: number;
    energy: number;
    waste: number;
    count: number;
  }> {
    const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
    const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 1);

    const activities = await this.findByUserIdAndDateRange(
      userId,
      startDate,
      endDate
    );

    let transport = 0;
    let energy = 0;
    let waste = 0;

    activities.forEach((activity: any) => {
      const emissions = activity.emissions || 0;
      if (activity.activityType === 'TRANSPORT') transport += emissions;
      else if (activity.activityType === 'ENERGY') energy += emissions;
      else if (activity.activityType === 'WASTE') waste += emissions;
    });

    return {
      total: transport + energy + waste,
      transport,
      energy,
      waste,
      count: activities.length,
    };
  }

  async deleteByUserId(userId: ObjectId): Promise<number> {
    const collection = await this.getCollection();
    const result = await collection.deleteMany({ userId });
    return result.deletedCount;
  }
}

/**
 * ReportRepository - DAO for Report entity
 * Specific database operations for Reports
 */
export class ReportRepository extends BaseRepository<any> {
  constructor() {
    super('reports');
  }

  async findByUserId(userId: ObjectId): Promise<any[]> {
    const collection = await this.getCollection();
    return (await collection
      .find({ userId })
      .sort({ month: -1 })
      .toArray()) as any[];
  }

  async findByUserIdAndMonth(userId: ObjectId, month: Date): Promise<any | null> {
    const collection = await this.getCollection();
    const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
    const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 1);

    return (await collection.findOne({
      userId,
      month: { $gte: startDate, $lt: endDate },
    })) as any | null;
  }

  async upsertMonthlyReport(
    userId: ObjectId,
    month: Date,
    reportData: any
  ): Promise<any> {
    const collection = await this.getCollection();
    const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
    const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 1);

    const result = await collection.findOneAndUpdate(
      { userId, month: { $gte: startDate, $lt: endDate } },
      {
        $set: {
          userId,
          month: startDate,
          ...reportData,
          updatedAt: new Date(),
        },
      },
      { upsert: true, returnDocument: 'after' }
    );

    return (result as any)?.value ?? result;
  }
}
