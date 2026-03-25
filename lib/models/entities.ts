import { ObjectId } from 'mongodb';

/**
 * Abstract base Entity class - Foundation for all domain entities
 * Implements core OOP principle: Encapsulation
 */
export abstract class Entity {
  protected _id?: ObjectId;
  protected createdAt: Date;
  protected updatedAt: Date;

  constructor() {
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  getId(): ObjectId | undefined {
    return this._id;
  }

  setId(id: ObjectId): void {
    this._id = id;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  updateTimestamp(): void {
    this.updatedAt = new Date();
  }

  abstract toJSON(): any;
}

/**
 * User Entity - Represents a system user
 */
export class User extends Entity {
  private email: string;
  private password: string;
  private name: string;
  private location: string;
  private preferences: UserPreferences;

  constructor(
    email: string,
    password: string,
    name: string,
    location: string = ''
  ) {
    super();
    this.email = email;
    this.password = password;
    this.name = name;
    this.location = location;
    this.preferences = {
      theme: 'light',
      notifications: true,
      emailUpdates: true,
    };
  }

  getEmail(): string {
    return this.email;
  }

  getPassword(): string {
    return this.password;
  }

  getName(): string {
    return this.name;
  }

  getLocation(): string {
    return this.location;
  }

  setLocation(location: string): void {
    this.location = location;
    this.updateTimestamp();
  }

  getPreferences(): UserPreferences {
    return this.preferences;
  }

  updatePreferences(preferences: Partial<UserPreferences>): void {
    this.preferences = { ...this.preferences, ...preferences };
    this.updateTimestamp();
  }

  toJSON(): any {
    return {
      _id: this._id,
      email: this.email,
      name: this.name,
      location: this.location,
      preferences: this.preferences,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  notifications: boolean;
  emailUpdates: boolean;
}

/**
 * Activity Entity - Base class for all activity types
 * Implements OOP principle: Inheritance and Polymorphism
 */
export abstract class Activity extends Entity {
  protected userId: ObjectId;
  protected activityType: ActivityType;
  protected emissionValue: number;
  protected unit: string;
  protected notes: string;

  constructor(
    userId: ObjectId,
    activityType: ActivityType,
    emissionValue: number,
    unit: string,
    notes: string = ''
  ) {
    super();
    this.userId = userId;
    this.activityType = activityType;
    this.emissionValue = emissionValue;
    this.unit = unit;
    this.notes = notes;
  }

  getUserId(): ObjectId {
    return this.userId;
  }

  getActivityType(): ActivityType {
    return this.activityType;
  }

  getEmissionValue(): number {
    return this.emissionValue;
  }

  getUnit(): string {
    return this.unit;
  }

  getNotes(): string {
    return this.notes;
  }

  setNotes(notes: string): void {
    this.notes = notes;
    this.updateTimestamp();
  }

  abstract calculateEmissions(): number;

  abstract toJSON(): any;
}

/**
 * TransportActivity - Represents transportation-related activities
 * Implements polymorphic behavior through inheritance
 */
export class TransportActivity extends Activity {
  private transportMode: TransportMode;
  private distance: number; // in kilometers

  constructor(
    userId: ObjectId,
    transportMode: TransportMode,
    distance: number,
    notes: string = ''
  ) {
    const emissionValue = distance;
    super(userId, 'TRANSPORT', emissionValue, 'km', notes);
    this.transportMode = transportMode;
    this.distance = distance;
  }

  getTransportMode(): TransportMode {
    return this.transportMode;
  }

  getDistance(): number {
    return this.distance;
  }

  calculateEmissions(): number {
    const emissionFactors: Record<TransportMode, number> = {
      CAR: 0.21, // kg CO2 per km
      BUS: 0.05,
      TRAIN: 0.02,
      FLIGHT: 0.225,
      MOTORCYCLE: 0.15,
      BICYCLE: 0,
      WALK: 0,
    };

    return this.distance * (emissionFactors[this.transportMode] || 0);
  }

  toJSON(): any {
    return {
      ...super.toJSON(),
      _id: this._id,
      userId: this.userId,
      activityType: this.activityType,
      transportMode: this.transportMode,
      distance: this.distance,
      emissionValue: this.emissionValue,
      emissions: this.calculateEmissions(),
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

/**
 * EnergyActivity - Represents energy consumption activities
 */
export class EnergyActivity extends Activity {
  private energyType: EnergyType;
  private consumption: number; // in kWh

  constructor(
    userId: ObjectId,
    energyType: EnergyType,
    consumption: number,
    notes: string = ''
  ) {
    const emissionValue = consumption;
    super(userId, 'ENERGY', emissionValue, 'kWh', notes);
    this.energyType = energyType;
    this.consumption = consumption;
  }

  getEnergyType(): EnergyType {
    return this.energyType;
  }

  getConsumption(): number {
    return this.consumption;
  }

  calculateEmissions(): number {
    const emissionFactors: Record<EnergyType, number> = {
      ELECTRICITY: 0.233, // kg CO2 per kWh (average grid)
      NATURAL_GAS: 0.185, // kg CO2 per kWh
      OIL: 0.267,
      RENEWABLE: 0,
    };

    return this.consumption * (emissionFactors[this.energyType] || 0);
  }

  toJSON(): any {
    return {
      ...super.toJSON(),
      _id: this._id,
      userId: this.userId,
      activityType: this.activityType,
      energyType: this.energyType,
      consumption: this.consumption,
      emissionValue: this.emissionValue,
      emissions: this.calculateEmissions(),
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

/**
 * WasteActivity - Represents waste-related activities
 */
export class WasteActivity extends Activity {
  private wasteType: WasteType;
  private amount: number; // in kg

  constructor(
    userId: ObjectId,
    wasteType: WasteType,
    amount: number,
    notes: string = ''
  ) {
    const emissionValue = amount;
    super(userId, 'WASTE', emissionValue, 'kg', notes);
    this.wasteType = wasteType;
    this.amount = amount;
  }

  getWasteType(): WasteType {
    return this.wasteType;
  }

  getAmount(): number {
    return this.amount;
  }

  calculateEmissions(): number {
    const emissionFactors: Record<WasteType, number> = {
      LANDFILL: 0.5, // kg CO2 per kg
      RECYCLING: 0.1,
      COMPOSTING: 0.02,
      INCINERATION: 1.2,
    };

    return this.amount * (emissionFactors[this.wasteType] || 0);
  }

  toJSON(): any {
    return {
      ...super.toJSON(),
      _id: this._id,
      userId: this.userId,
      activityType: this.activityType,
      wasteType: this.wasteType,
      amount: this.amount,
      emissionValue: this.emissionValue,
      emissions: this.calculateEmissions(),
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

// Type definitions
export type ActivityType = 'TRANSPORT' | 'ENERGY' | 'WASTE';
export type TransportMode =
  | 'CAR'
  | 'BUS'
  | 'TRAIN'
  | 'FLIGHT'
  | 'MOTORCYCLE'
  | 'BICYCLE'
  | 'WALK';
export type EnergyType = 'ELECTRICITY' | 'NATURAL_GAS' | 'OIL' | 'RENEWABLE';
export type WasteType = 'LANDFILL' | 'RECYCLING' | 'COMPOSTING' | 'INCINERATION';

/**
 * Report Entity - Represents a monthly emission report
 */
export class Report extends Entity {
  private userId: ObjectId;
  private month: Date;
  private totalEmissions: number;
  private transportEmissions: number;
  private energyEmissions: number;
  private wasteEmissions: number;
  private activityCount: number;

  constructor(
    userId: ObjectId,
    month: Date,
    totalEmissions: number = 0,
    transportEmissions: number = 0,
    energyEmissions: number = 0,
    wasteEmissions: number = 0,
    activityCount: number = 0
  ) {
    super();
    this.userId = userId;
    this.month = month;
    this.totalEmissions = totalEmissions;
    this.transportEmissions = transportEmissions;
    this.energyEmissions = energyEmissions;
    this.wasteEmissions = wasteEmissions;
    this.activityCount = activityCount;
  }

  getUserId(): ObjectId {
    return this.userId;
  }

  getMonth(): Date {
    return this.month;
  }

  getTotalEmissions(): number {
    return this.totalEmissions;
  }

  updateEmissions(transport: number, energy: number, waste: number): void {
    this.transportEmissions = transport;
    this.energyEmissions = energy;
    this.wasteEmissions = waste;
    this.totalEmissions = transport + energy + waste;
    this.updateTimestamp();
  }

  setActivityCount(count: number): void {
    this.activityCount = count;
    this.updateTimestamp();
  }

  toJSON(): any {
    return {
      _id: this._id,
      userId: this.userId,
      month: this.month,
      totalEmissions: this.totalEmissions,
      transportEmissions: this.transportEmissions,
      energyEmissions: this.energyEmissions,
      wasteEmissions: this.wasteEmissions,
      activityCount: this.activityCount,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
