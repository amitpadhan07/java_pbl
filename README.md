# CarbonTrack - Web-Based Carbon Footprint Tracker

A modern, full-stack web application built with **Next.js 16**, **React 19**, **TypeScript**, and **MongoDB** that tracks personal carbon emissions and helps users make sustainable choices.

## Features

### 1. **User Authentication**
- Secure registration and login system
- Password hashing with bcryptjs
- Session-based authentication with localStorage

### 2. **Activity Tracking**
- **Transport Activities**: Car, Bus, Train, Flight, Motorcycle, Bicycle, Walk
- **Energy Activities**: Electricity, Natural Gas, Oil, Renewable Energy
- **Waste Activities**: Landfill, Recycling, Composting, Incineration

### 3. **Emissions Calculation**
- Real-time calculation based on scientifically-backed emission factors
- Automatic aggregation by category
- Monthly and yearly statistics

### 4. **Dashboard & Analytics**
- Interactive charts showing emissions breakdown
- Monthly statistics with pie and bar charts
- Visual comparison of different activity types

### 5. **Reports & Insights**
- Monthly emission reports
- Yearly trend analysis
- Category-based insights (Transport, Energy, Waste)

### 6. **User Profile Management**
- View and edit profile information
- Update location preferences
- Account deletion functionality

## Architecture & Design Patterns

### Layered Architecture
The application follows a clean, enterprise-level architecture:

```
Presentation Layer (React Components)
    ↓
API Layer (Next.js Route Handlers)
    ↓
Service Layer (Business Logic)
    ↓
Repository Layer (Data Access)
    ↓
Database Layer (MongoDB)
```

### Object-Oriented Programming (OOP) Principles

1. **Encapsulation**: All entities encapsulate their data and provide getters/setters
2. **Inheritance**: Base classes (`Entity`, `BaseRepository`, `BaseService`) define common behavior
3. **Polymorphism**: `Activity` base class with `TransportActivity`, `EnergyActivity`, `WasteActivity` subclasses
4. **Abstraction**: Abstract base classes define interfaces for derived classes
5. **Single Responsibility**: Each class has one reason to change

### Design Patterns Implemented

1. **Repository Pattern (DAO)**: `BaseRepository`, `UserRepository`, `ActivityRepository`, `ReportRepository`
2. **Service Layer Pattern**: `AuthenticationService`, `ActivityService`, `ReportService`, `UserService`
3. **Factory Pattern**: Activity creation methods in `ActivityService`
4. **Strategy Pattern**: Polymorphic `calculateEmissions()` methods
5. **Singleton Pattern**: MongoDB connection reuse with caching

## Project Structure

```
/app
  /api
    /auth
      /register
      /login
    /activities
      /[id]
    /reports
    /users
  /dashboard
  /profile
  /reports
  /page.tsx (Landing/Auth)
  /layout.tsx
  /globals.css

/lib
  /models
    /entities.ts (Entity classes)
  /repositories
    /repositories.ts (Data access layer)
  /services
    /services.ts (Business logic layer)
  /mongodb.ts (Database connection)

/components
  /auth
    /login-form.tsx
    /register-form.tsx
  /dashboard
    /activity-form.tsx
    /activity-list.tsx
    /stats-overview.tsx
  /ui (shadcn components)
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB instance running locally or MongoDB Atlas connection string

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd carbontrack
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Set up environment variables**
Create a `.env.local` file:
```
MONGODB_URI=mongodb://localhost:27017
```

4. **Run the development server**
```bash
pnpm dev
```

5. **Open in browser**
Navigate to `http://localhost:3000`

## Emission Factors Used

The application uses the following emission factors:

### Transport (kg CO₂ per km)
- Car: 0.21
- Bus: 0.05
- Train: 0.02
- Flight: 0.225
- Motorcycle: 0.15
- Bicycle: 0
- Walk: 0

### Energy (kg CO₂ per kWh)
- Electricity: 0.233
- Natural Gas: 0.185
- Oil: 0.267
- Renewable: 0

### Waste (kg CO₂ per kg)
- Landfill: 0.5
- Recycling: 0.1
- Composting: 0.02
- Incineration: 1.2

## Technology Stack

- **Frontend**: React 19, Next.js 16, TypeScript
- **UI Components**: shadcn/ui with Tailwind CSS
- **Database**: MongoDB
- **Charts**: Recharts
- **Authentication**: Custom with bcryptjs
- **State Management**: React hooks, localStorage
- **Styling**: Tailwind CSS 4.2 with semantic design tokens

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Login to existing account

### Activities
- `GET /api/activities?userId={id}` - Get user activities
- `POST /api/activities` - Create new activity
- `GET /api/activities/{id}` - Get activity details
- `DELETE /api/activities/{id}` - Delete activity

### Reports
- `GET /api/reports?userId={id}` - Get monthly reports
- `POST /api/reports` - Generate monthly report

### Users
- `GET /api/users?userId={id}` - Get user profile
- `PUT /api/users` - Update user profile
- `DELETE /api/users?userId={id}` - Delete user account

## Key Features Implementation

### Emission Calculation Strategy
Each activity type implements polymorphic behavior:
```typescript
// Base class with abstract method
abstract class Activity {
  abstract calculateEmissions(): number;
}

// Concrete implementations
class TransportActivity extends Activity {
  calculateEmissions(): number {
    const emissionFactors = { CAR: 0.21, BUS: 0.05, ... };
    return this.distance * emissionFactors[this.transportMode];
  }
}
```

### Data Persistence
- MongoDB for persistent storage
- Collections: users, activities, reports, emissionFactors
- Automatic timestamp tracking (createdAt, updatedAt)

### Security
- Password hashing with bcryptjs (10 salt rounds)
- Client-side storage of userId only
- Secure API endpoints

## Usage Workflow

1. **Sign Up**: Create an account with email and password
2. **Log Activity**: Record daily transportation, energy use, and waste
3. **View Dashboard**: See real-time statistics and charts
4. **Check Reports**: View monthly and yearly trends
5. **Manage Profile**: Update location and preferences

## Future Enhancements

- [ ] Social sharing of sustainability goals
- [ ] Peer comparison and community challenges
- [ ] AI-powered recommendations for reducing emissions
- [ ] Integration with fitness trackers for cycling/walking data
- [ ] Export reports as PDF
- [ ] Mobile app with offline support
- [ ] Real-time data sync across devices

## Contributing

Feel free to fork, submit issues, and create pull requests for any improvements.

## License

This project is open-source and available under the MIT License.

## Support

For support, please open an issue on the GitHub repository or contact the development team.

---

**CarbonTrack** - *Track your impact, change your future.*
