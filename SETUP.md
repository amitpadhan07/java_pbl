# CarbonTrack Setup Guide

## Quick Start

### Prerequisites
- Node.js 18+ installed
- MongoDB instance (local or MongoDB Atlas)

### Installation Steps

1. **Install Dependencies**
```bash
pnpm install
```

2. **Set Environment Variables**
Create `.env.local` in the project root:
```
MONGODB_URI=mongodb://localhost:27017
```

For MongoDB Atlas, use:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/carbontrack
```

3. **Start Development Server**
```bash
pnpm dev
```

4. **Open Application**
Navigate to `http://localhost:3000`

## Testing the Application

### Test Account
You can create a new account or use these test credentials:
- Email: test@example.com
- Password: Test123!

### Sample Activities to Log

**Transport:**
- Mode: Car, Distance: 15 km
- Mode: Bus, Distance: 10 km
- Mode: Flight, Distance: 1000 km

**Energy:**
- Electricity: 50 kWh
- Natural Gas: 20 kWh

**Waste:**
- Landfill: 5 kg
- Recycling: 3 kg

## Architecture Overview

### Database Schema

**Users Collection**
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  name: String,
  location: String,
  preferences: {
    theme: String,
    notifications: Boolean,
    emailUpdates: Boolean
  },
  createdAt: Date,
  updatedAt: Date
}
```

**Activities Collection**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  activityType: String (TRANSPORT|ENERGY|WASTE),
  transportMode: String (optional),
  distance: Number (optional),
  energyType: String (optional),
  consumption: Number (optional),
  wasteType: String (optional),
  amount: Number (optional),
  emissions: Number (calculated),
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Reports Collection**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  month: Date,
  totalEmissions: Number,
  transportEmissions: Number,
  energyEmissions: Number,
  wasteEmissions: Number,
  activityCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## Code Organization

### Core Services (lib/services/services.ts)
- `AuthenticationService`: User registration and login
- `ActivityService`: Activity CRUD and calculations
- `ReportService`: Report generation and statistics
- `UserService`: User profile management

### Repositories (lib/repositories/repositories.ts)
- `BaseRepository`: Abstract base class for all DAOs
- `UserRepository`: User data access
- `ActivityRepository`: Activity data access with aggregation
- `ReportRepository`: Report data access with upsert logic

### Models (lib/models/entities.ts)
- `Entity`: Base class for all entities
- `User`: User entity
- `Activity`: Abstract base activity
- `TransportActivity`: Transport-specific implementation
- `EnergyActivity`: Energy-specific implementation
- `WasteActivity`: Waste-specific implementation
- `Report`: Monthly report entity

## API Routes

### POST /api/auth/register
**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "location": "New York, USA"
}
```

### POST /api/auth/login
**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### POST /api/activities
**Request (Transport):**
```json
{
  "userId": "ObjectId",
  "activityType": "TRANSPORT",
  "transportMode": "CAR",
  "distance": 15,
  "notes": "Commute to office"
}
```

### GET /api/reports?userId={id}&month={ISODate}
Returns monthly report with emission totals

## Troubleshooting

### MongoDB Connection Issues
- Verify MongoDB is running: `mongosh`
- Check connection string in `.env.local`
- Ensure MongoDB database is accessible

### Missing Dependencies
```bash
pnpm install
pnpm dedupe
```

### Build Issues
```bash
pnpm clean
rm -rf .next
pnpm build
```

## Performance Tips

1. **Database Indexing**: Indexes are automatically created on:
   - users.email (unique)
   - activities.userId
   - activities.createdAt
   - reports.userId

2. **Query Optimization**: 
   - Activities loaded sorted by createdAt (descending)
   - Monthly stats calculated server-side
   - Reports cached in state

3. **UI Optimization**:
   - Charts use Recharts for efficient rendering
   - Component splitting for better code-splitting
   - Lazy loading of page components

## Security Considerations

1. **Password Security**:
   - Bcrypt with 10 salt rounds
   - Passwords never exposed in responses
   - Client-side validation before submission

2. **Session Management**:
   - userId stored in localStorage
   - Server-side validation of all requests
   - CORS headers properly configured

3. **Input Validation**:
   - Type checking with TypeScript
   - MongoDB ObjectId validation
   - Numeric input constraints

## Deployment

### To Vercel
1. Push code to GitHub
2. Connect repository to Vercel
3. Add `MONGODB_URI` environment variable
4. Deploy!

### To Self-Hosted Server
1. Build: `pnpm build`
2. Start: `pnpm start`
3. Use process manager: `pm2 start npm -- start`

## Contributing

- Follow TypeScript strict mode
- Implement OOP principles
- Add proper error handling
- Write meaningful commit messages

## Support

Refer to the main README.md for more detailed information about features and architecture.
