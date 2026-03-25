import { ObjectId } from 'mongodb';
import {
  User,
  TransportActivity,
  EnergyActivity,
  WasteActivity,
  Report,
  TransportMode,
  EnergyType,
  WasteType,
} from '@/lib/models/entities';
import {
  UserRepository,
  ActivityRepository,
  ReportRepository,
} from '@/lib/repositories/repositories';
import * as bcrypt from 'bcryptjs';

/**
 * Abstract BaseService - Foundation for all service classes
 * Implements Service Layer Pattern
 * Principle: Separation of Concerns and Business Logic Encapsulation
 */
export abstract class BaseService {
  protected userRepo: UserRepository;
  protected activityRepo: ActivityRepository;
  protected reportRepo: ReportRepository;

  constructor() {
    this.userRepo = new UserRepository();
    this.activityRepo = new ActivityRepository();
    this.reportRepo = new ReportRepository();
  }
}

/**
 * AuthenticationService - Handles user authentication and account management
 * Implements: Single Responsibility Principle
 */
export class AuthenticationService extends BaseService {
  private readonly SALT_ROUNDS = 10;

  async registerUser(
    email: string,
    password: string,
    name: string,
    location: string = ''
  ): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepo.findByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

    // Create user entity
    const user = new User(email, hashedPassword, name, location);

    // Save to database
    const result = await this.userRepo.create(user.toJSON());
    const savedUser = new User(
      result.email,
      result.password,
      result.name,
      result.location
    );
    savedUser.setId(result._id);
    return savedUser;
  }

  async loginUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async getUserById(userId: ObjectId): Promise<User | null> {
    return await this.userRepo.findById(userId);
  }
}

/**
 * ActivityService - Handles activity CRUD and emission calculations
 * Implements: Factory Pattern and Strategy Pattern for polymorphic behavior
 */
export class ActivityService extends BaseService {
  async createTransportActivity(
    userId: ObjectId,
    transportMode: TransportMode,
    distance: number,
    notes: string = ''
  ): Promise<TransportActivity> {
    const activity = new TransportActivity(userId, transportMode, distance, notes);
    const savedActivity = await this.activityRepo.create(activity.toJSON());
    return this.mapToTransportActivity(savedActivity);
  }

  async createEnergyActivity(
    userId: ObjectId,
    energyType: EnergyType,
    consumption: number,
    notes: string = ''
  ): Promise<EnergyActivity> {
    const activity = new EnergyActivity(userId, energyType, consumption, notes);
    const savedActivity = await this.activityRepo.create(activity.toJSON());
    return this.mapToEnergyActivity(savedActivity);
  }

  async createWasteActivity(
    userId: ObjectId,
    wasteType: WasteType,
    amount: number,
    notes: string = ''
  ): Promise<WasteActivity> {
    const activity = new WasteActivity(userId, wasteType, amount, notes);
    const savedActivity = await this.activityRepo.create(activity.toJSON());
    return this.mapToWasteActivity(savedActivity);
  }

  async getUserActivities(userId: ObjectId): Promise<any[]> {
    return await this.activityRepo.findByUserId(userId);
  }

  async getActivityById(activityId: ObjectId): Promise<any | null> {
    return await this.activityRepo.findById(activityId);
  }

  async updateActivity(activityId: ObjectId, updates: any): Promise<any | null> {
    return await this.activityRepo.update(activityId, updates);
  }

  async deleteActivity(activityId: ObjectId): Promise<boolean> {
    return await this.activityRepo.delete(activityId);
  }

  async getUserActivitiesByType(
    userId: ObjectId,
    activityType: string
  ): Promise<any[]> {
    return await this.activityRepo.findByUserIdAndType(userId, activityType);
  }

  async getMonthlyStats(
    userId: ObjectId,
    month: Date
  ): Promise<{
    total: number;
    transport: number;
    energy: number;
    waste: number;
    count: number;
  }> {
    return await this.activityRepo.getMonthlyStats(userId, month);
  }

  private mapToTransportActivity(data: any): TransportActivity {
    const activity = new TransportActivity(
      new ObjectId(data.userId),
      data.transportMode,
      data.distance,
      data.notes
    );
    activity.setId(new ObjectId(data._id));
    return activity;
  }

  private mapToEnergyActivity(data: any): EnergyActivity {
    const activity = new EnergyActivity(
      new ObjectId(data.userId),
      data.energyType,
      data.consumption,
      data.notes
    );
    activity.setId(new ObjectId(data._id));
    return activity;
  }

  private mapToWasteActivity(data: any): WasteActivity {
    const activity = new WasteActivity(
      new ObjectId(data.userId),
      data.wasteType,
      data.amount,
      data.notes
    );
    activity.setId(new ObjectId(data._id));
    return activity;
  }
}

/**
 * ReportService - Handles report generation and statistics
 * Implements: Template Method Pattern
 */
export class ReportService extends BaseService {
  async generateMonthlyReport(userId: ObjectId, month: Date): Promise<Report> {
    const stats = await this.activityRepo.getMonthlyStats(userId, month);

    const report = new Report(
      userId,
      month,
      stats.total,
      stats.transport,
      stats.energy,
      stats.waste,
      stats.count
    );

    const savedReport = await this.reportRepo.upsertMonthlyReport(
      userId,
      month,
      report.toJSON()
    );

    return this.mapToReport(savedReport);
  }

  async getUserMonthlyReports(userId: ObjectId): Promise<Report[]> {
    const reports = await this.reportRepo.findByUserId(userId);
    return reports.map(r => this.mapToReport(r));
  }

  async getReportForMonth(userId: ObjectId, month: Date): Promise<Report | null> {
    const report = await this.reportRepo.findByUserIdAndMonth(userId, month);
    return report ? this.mapToReport(report) : null;
  }

  async getYearlyStats(userId: ObjectId, year: number): Promise<{
    months: any[];
    totalYearlyEmissions: number;
    averageMonthlyEmissions: number;
  }> {
    const reports = await this.reportRepo.findByUserId(userId);
    const yearReports = reports.filter(
      r =>
        new Date(r.month).getFullYear() === year ||
        new Date(r.createdAt).getFullYear() === year
    );

    const totalYearlyEmissions = yearReports.reduce(
      (sum, r) => sum + (r.totalEmissions || 0),
      0
    );
    const averageMonthlyEmissions =
      yearReports.length > 0 ? totalYearlyEmissions / yearReports.length : 0;

    return {
      months: yearReports,
      totalYearlyEmissions,
      averageMonthlyEmissions,
    };
  }

  private mapToReport(data: any): Report {
    const report = new Report(
      new ObjectId(data.userId),
      new Date(data.month),
      data.totalEmissions,
      data.transportEmissions,
      data.energyEmissions,
      data.wasteEmissions,
      data.activityCount
    );
    report.setId(new ObjectId(data._id));
    return report;
  }
}

/**
 * UserService - Handles user profile and preferences
 * Implements: Single Responsibility and Encapsulation
 */
export class UserService extends BaseService {
  async updateUserProfile(
    userId: ObjectId,
    location: string
  ): Promise<User | null> {
    const result = await this.userRepo.updateUserLocation(userId, location);
    if (!result) return null;

    const user = new User(
      result.email,
      result.password,
      result.name,
      result.location
    );
    user.setId(new ObjectId(result._id));
    return user;
  }

  async updateUserPreferences(
    userId: ObjectId,
    preferences: any
  ): Promise<User | null> {
    const result = await this.userRepo.updateUserPreferences(userId, preferences);
    if (!result) return null;

    const user = new User(
      result.email,
      result.password,
      result.name,
      result.location
    );
    user.setId(new ObjectId(result._id));
    return user;
  }

  async getUserProfile(userId: ObjectId): Promise<User | null> {
    return await this.userRepo.findById(userId);
  }

  async deleteUserAccount(userId: ObjectId): Promise<boolean> {
    // Delete all user activities
    await this.activityRepo.deleteByUserId(userId);
    // Delete user account
    return await this.userRepo.delete(userId);
  }
}
