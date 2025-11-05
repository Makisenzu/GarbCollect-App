# GarbCollect - Waste Management System

A comprehensive web-based garbage collection management system designed to streamline waste collection operations, improve communication between residents and waste management services, and enhance overall efficiency in municipal waste management.

## Overview

GarbCollect is a full-stack application that facilitates the coordination of garbage collection activities across municipalities, barangays, and puroks. The system provides real-time tracking, scheduling, and reporting capabilities for efficient waste management operations.

## Technology Stack

### Backend
- **Framework:** Laravel 12.0 (PHP 8.2+)
- **Authentication:** Laravel Sanctum
- **Real-time Communication:** Laravel Reverb, Pusher
- **API Integration:** Guzzle HTTP Client
- **Testing:** Pest PHP

### Frontend
- **Framework:** React 18.2 with Inertia.js 2.0
- **UI Components:** Headless UI, Lucide React Icons, React Icons
- **Styling:** Tailwind CSS 3.2 with Forms Plugin
- **Build Tool:** Vite 6.2
- **Mapping:** Mapbox GL 3.13
- **Charts:** Recharts 3.1
- **Notifications:** SweetAlert2
- **Date Management:** date-fns 4.1
- **Form Components:** React Select 5.10

### Additional Tools
- **Real-time Echo:** Laravel Echo with React integration
- **Content Moderation:** OpenAI API integration
- **Development:** Concurrently, Laravel Pail

## Key Features

### User Management
- Multi-role system (Admin, Driver, Resident, Applicant)
- User authentication and authorization
- Profile management with photo support
- Account activation/deactivation

### Geographic Organization
- Hierarchical location structure:
  - Municipalities (City/Municipality types)
  - Barangays (Urban/Rural types)
  - Puroks (neighborhoods)
- Site management for collection points

### Garbage Collection Operations
- **Schedule Management:** Create and manage collection schedules by barangay
- **Driver Assignment:** Assign drivers to specific collection routes
- **Collection Queue:** Track collection sites in sequential order
- **Real-time Tracking:** Monitor driver locations with GPS coordinates
- **Status Tracking:** Track collection progress (pending, active, finished)

### Driver Features
- License verification system
- Real-time location updates
- Active schedule tracking
- On-duty status management
- Mobile-friendly driver interface

### Reporting System
- Photo-based garbage reports
- Sack count tracking
- Schedule-linked reporting
- Garbage type categorization
- Report validation with tokens

### Review and Feedback
- Category-based review system
- Rating system (1-5 stars)
- Content moderation using AI (OpenAI)
- Review status workflow (pending, approved, rejected)
- Reply functionality for administrators

### Fleet Management
- Truck registration and tracking
- Plate number management
- Availability status monitoring
- Assignment to collection schedules

### Real-time Features
- Live driver location tracking
- Collection status updates
- Real-time notifications using Laravel Reverb
- WebSocket integration with Pusher

## Database Architecture

### Core Entities
1. **Users** - System users with role-based access
2. **Drivers** - Extended user profiles for collection drivers
3. **Municipalities** - Top-level geographic divisions
4. **Barangays** - Municipal subdivisions
5. **Puroks** - Neighborhood-level divisions
6. **Sites** - Specific collection locations with coordinates
7. **Schedules** - Collection appointments and routes
8. **Collection Queue** - Ordered list of sites to visit
9. **Reports** - Photo and data reports from collections
10. **Reviews** - Public feedback and ratings
11. **Categories** - Classification for reviews/reports
12. **Garbage Types** - Waste classification system
13. **Trucks** - Fleet vehicle management

## System Workflows

### Collection Process
1. Admin creates collection schedule for a barangay
2. Driver is assigned to the schedule
3. Collection queue is generated with site sequence
4. Driver starts collection and updates location in real-time
5. At each site, driver marks completion
6. Reports are submitted with photos and sack counts
7. Schedule is marked finished when all sites are completed

### Review Moderation
1. Residents submit reviews with ratings and suggestions
2. AI moderation service screens content for inappropriate material
3. Admin reviews flagged content
4. Reviews are approved or rejected
5. Approved reviews are visible to the public
6. Admin can reply to approved reviews

### Driver Management
1. Users apply to become drivers
2. Admin verifies license information
3. Driver account is activated
4. Driver is assigned to specific barangay
5. Driver receives daily schedules
6. Location tracking during on-duty hours

## Development Setup

### Prerequisites
- PHP 8.2 or higher
- Composer
- Node.js and NPM
- MySQL/PostgreSQL/SQLite database
- OpenAI API key (for content moderation)
- Mapbox API key (for mapping features)

### Installation

1. Clone the repository
2. Install PHP dependencies:
   ```bash
   composer install
   ```

3. Install JavaScript dependencies:
   ```bash
   npm install
   ```

4. Copy environment file and configure:
   ```bash
   cp .env.example .env
   ```

5. Generate application key:
   ```bash
   php artisan key:generate
   ```

6. Run database migrations:
   ```bash
   php artisan migrate
   ```

7. Seed the database (optional):
   ```bash
   php artisan db:seed
   ```

### Running the Application

#### Development Mode
Run all services concurrently:
```bash
composer dev
```

This starts:
- Laravel development server
- Queue listener
- Log monitoring (Pail)
- Vite dev server

#### Individual Services
```bash
# Backend server
php artisan serve

# Frontend build
npm run dev

# Queue worker
php artisan queue:listen

# Logs
php artisan pail
```

### Building for Production
```bash
npm run build
```

## Testing

Run the test suite:
```bash
composer test
```

Or directly with Pest:
```bash
php artisan test
```

## Security Features

- Laravel Sanctum API authentication
- Password hashing and secure storage
- CSRF protection
- Content moderation for user-generated content
- Role-based access control
- Secure API token management for mobile integration

## Configuration

Key configuration files:
- `config/database.php` - Database connections
- `config/services.php` - Third-party service credentials
- `config/broadcasting.php` - Real-time broadcasting setup
- `config/queue.php` - Background job processing
- `config/reverb.php` - WebSocket server configuration

## License

This project is proprietary software developed as a capstone project. All rights reserved.

## Support

For system-related inquiries, please contact the development team through your institution's designated channels.
