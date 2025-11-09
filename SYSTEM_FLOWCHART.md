# GarbCollect System Flowchart

## System Overview Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        GARBCOLLECT SYSTEM                         │
└─────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                    ▼             ▼             ▼
            ┌──────────┐   ┌──────────┐   ┌──────────┐
            │  PUBLIC  │   │  ADMIN   │   │  DRIVER  │
            │   USER   │   │          │   │          │
            └──────────┘   └──────────┘   └──────────┘
```

---

## 1. User Access Flow

```
                    START
                      │
                      ▼
            ┌──────────────────┐
            │  Access System   │
            └──────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
┌─────────────┐ ┌──────────┐ ┌──────────┐
│ Public User │ │  Login   │ │ Register │
│  (No Auth)  │ │ Required │ │ Account  │
└─────────────┘ └──────────┘ └──────────┘
        │             │             │
        │             ▼             │
        │      ┌──────────┐         │
        │      │Auth Check│         │
        │      └──────────┘         │
        │             │             │
        │       ┌─────┼─────┐       │
        │       ▼           ▼       │
        │   ┌──────┐   ┌────────┐  │
        │   │Admin │   │ Driver │  │
        │   │ Role │   │  Role  │  │
        │   └──────┘   └────────┘  │
        │       │           │       │
        └───────┴───────────┴───────┘
                      │
                      ▼
              Access Granted
```

---

## 2. Admin Workflow

```
                    ADMIN LOGIN
                         │
                         ▼
                ┌────────────────┐
                │ Admin Dashboard│
                └────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
┌─────────────────┐ ┌──────────┐ ┌─────────────┐
│Location Mgmt    │ │Driver    │ │Schedule     │
│• Municipality   │ │Mgmt      │ │Management   │
│• Barangay       │ │          │ │             │
│• Purok          │ └──────────┘ └─────────────┘
│• Collection Sites│      │              │
└─────────────────┘      │              │
         │               ▼              ▼
         │      ┌────────────────┐ ┌──────────────┐
         │      │• Add Driver    │ │• Create      │
         │      │• Assign to     │ │  Schedule    │
         │      │  Barangay      │ │• Assign      │
         │      │• Verify License│ │  Driver      │
         │      │• Activate/     │ │• Set Route   │
         │      │  Deactivate    │ │  Order       │
         │      └────────────────┘ └──────────────┘
         │               │              │
         ▼               ▼              ▼
┌─────────────────┐ ┌──────────┐ ┌─────────────┐
│Review & Feedback│ │Reports   │ │Fleet Mgmt   │
│• Moderate AI    │ │Monitoring│ │• Trucks     │
│• Approve/Reject │ │          │ │• Assign to  │
│• Reply Reviews  │ │          │ │  Schedule   │
└─────────────────┘ └──────────┘ └─────────────┘
```

---

## 3. Driver Workflow

```
                   DRIVER LOGIN
                        │
                        ▼
               ┌────────────────┐
               │Driver Dashboard│
               │• View Schedules│
               │• Check Routes  │
               └────────────────┘
                        │
                        ▼
                ┌──────────────┐
                │View Today's  │
                │Schedule      │
                └──────────────┘
                        │
                        ▼
                ┌──────────────┐
            ┌───│Start Schedule│───┐
            │   └──────────────┘   │
            │           │           │
            NO          │           YES
            │           ▼           │
            │   ┌──────────────┐   │
            │   │• Set On-Duty │   │
            │   │• Start GPS   │   │
            │   │  Tracking    │   │
            │   └──────────────┘   │
            │           │           │
            │           ▼           │
            │   ┌──────────────┐   │
            │   │Navigate to   │   │
            │   │Collection    │   │
            │   │Sites (Queue) │   │
            │   └──────────────┘   │
            │           │           │
            │           ▼           │
            │   ┌──────────────┐   │
            │   │At Each Site: │   │
            │   │• Update GPS  │   │
            │   │• Generate    │   │
            │   │  Report Token│   │
            │   └──────────────┘   │
            │           │           │
            │           ▼           │
            │   ┌──────────────┐   │
            │   │Submit Report:│   │
            │   │• Photos      │   │
            │   │• Sack Count  │   │
            │   │• Garbage Type│   │
            │   │• Token Valid │   │
            │   └──────────────┘   │
            │           │           │
            │           ▼           │
            │   ┌──────────────┐   │
            │   │Mark Site     │   │
            │   │Completed     │   │
            │   └──────────────┘   │
            │           │           │
            │           ▼           │
            │   ┌──────────────┐   │
            │   │All Sites     │   │
            │   │Done?         │   │
            │   └──────────────┘   │
            │      │         │      │
            │      NO       YES     │
            │      │         │      │
            │      │         ▼      │
            │      │  ┌──────────┐  │
            │      │  │Complete  │  │
            │      │  │Schedule  │  │
            │      │  └──────────┘  │
            │      │         │      │
            │      └─────────┴──────┘
            │                │
            └────────────────┘
                        │
                        ▼
                    END DUTY
```

---

## 4. Collection Process Flow

```
        START COLLECTION
              │
              ▼
    ┌──────────────────┐
    │Admin Creates     │
    │Schedule for      │
    │Barangay          │
    └──────────────────┘
              │
              ▼
    ┌──────────────────┐
    │Assign:           │
    │• Driver          │
    │• Truck           │
    │• Collection Sites│
    └──────────────────┘
              │
              ▼
    ┌──────────────────┐
    │Generate          │
    │Collection Queue  │
    │(Ordered Sites)   │
    └──────────────────┘
              │
              ▼
    ┌──────────────────┐
    │Driver Starts     │
    │Schedule          │
    │(Status: Active)  │
    └──────────────────┘
              │
              ▼
    ┌──────────────────┐
    │Real-time GPS     │
    │Tracking Active   │
    └──────────────────┘
              │
    ┌─────────┴─────────┐
    │                   │
    ▼                   ▼
┌──────────┐    ┌──────────────┐
│Navigate  │    │Public Can    │
│to Site 1 │    │Track Driver  │
└──────────┘    │Location Live │
    │           └──────────────┘
    ▼
┌──────────────────┐
│Arrive at Site    │
└──────────────────┘
    │
    ▼
┌──────────────────┐
│Collect Garbage   │
└──────────────────┘
    │
    ▼
┌──────────────────┐
│Generate Token    │
└──────────────────┘
    │
    ▼
┌──────────────────┐
│Submit Report:    │
│• Photo           │
│• Sack Count      │
│• Garbage Type    │
│• Validate Token  │
└──────────────────┘
    │
    ▼
┌──────────────────┐
│Mark Site         │
│Completed         │
└──────────────────┘
    │
    ▼
┌──────────────────┐
│More Sites?       │
└──────────────────┘
    │       │
   YES      NO
    │       │
    │       ▼
    │  ┌──────────────┐
    │  │All Sites     │
    │  │Completed     │
    │  └──────────────┘
    │       │
    │       ▼
    │  ┌──────────────┐
    │  │Complete      │
    │  │Schedule      │
    │  │(Status:      │
    │  │Finished)     │
    │  └──────────────┘
    │       │
    └───────┘
            │
            ▼
        END COLLECTION
```

---

## 5. Public User Flow

```
            PUBLIC USER
                 │
     ┌───────────┼───────────┐
     │           │           │
     ▼           ▼           ▼
┌─────────┐ ┌─────────┐ ┌──────────┐
│View     │ │Track    │ │Submit    │
│Schedule │ │Live     │ │Review    │
│by       │ │Driver   │ │          │
│Barangay │ │Location │ │          │
└─────────┘ └─────────┘ └──────────┘
     │           │           │
     ▼           ▼           ▼
┌─────────┐ ┌─────────┐ ┌──────────┐
│• See    │ │• Select │ │• Choose  │
│  When   │ │  Baran- │ │  Category│
│• See    │ │  gay    │ │• Rate    │
│  Route  │ │• View   │ │  1-5     │
│• See    │ │  Active │ │  Stars   │
│  Time   │ │  Truck  │ │• Write   │
│         │ │• Map    │ │  Comment │
│         │ │  Track  │ │• Suggest │
└─────────┘ └─────────┘ └──────────┘
                 │           │
                 ▼           ▼
         ┌─────────────┐ ┌──────────┐
         │Real-time    │ │AI Content│
         │Updates via  │ │Moderation│
         │WebSocket    │ └──────────┘
         └─────────────┘      │
                              ▼
                         ┌──────────┐
                         │Admin     │
                         │Review    │
                         └──────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
               ┌─────────┐         ┌─────────┐
               │Approve  │         │Reject   │
               │& Publish│         │         │
               └─────────┘         └─────────┘
                    │
                    ▼
               ┌─────────┐
               │Admin Can│
               │Reply    │
               └─────────┘
```

---

## 6. Review & Feedback System Flow

```
                REVIEW SUBMISSION
                        │
                        ▼
                ┌──────────────┐
                │User Submits: │
                │• Category    │
                │• Rating      │
                │• Comment     │
                │• Suggestion  │
                └──────────────┘
                        │
                        ▼
                ┌──────────────┐
                │AI Moderation │
                │(OpenAI API)  │
                │Check Content │
                └──────────────┘
                        │
            ┌───────────┴───────────┐
            ▼                       ▼
    ┌──────────────┐        ┌──────────────┐
    │Content       │        │Content       │
    │Appropriate   │        │Flagged       │
    │              │        │              │
    └──────────────┘        └──────────────┘
            │                       │
            ▼                       ▼
    ┌──────────────┐        ┌──────────────┐
    │Status:       │        │Status:       │
    │Pending       │        │Pending       │
    │              │        │(Needs Extra  │
    │              │        │ Review)      │
    └──────────────┘        └──────────────┘
            │                       │
            └───────────┬───────────┘
                        ▼
                ┌──────────────┐
                │Admin Reviews │
                └──────────────┘
                        │
            ┌───────────┴───────────┐
            ▼                       ▼
    ┌──────────────┐        ┌──────────────┐
    │Approve       │        │Reject        │
    │              │        │              │
    └──────────────┘        └──────────────┘
            │                       │
            ▼                       ▼
    ┌──────────────┐        ┌──────────────┐
    │Publish to    │        │Not Displayed │
    │Public        │        │              │
    └──────────────┘        └──────────────┘
            │
            ▼
    ┌──────────────┐
    │Admin Can     │
    │Add Reply     │
    └──────────────┘
            │
            ▼
    ┌──────────────┐
    │Visible to    │
    │All Users     │
    └──────────────┘
```

---

## 7. Real-time Tracking System

```
    ┌──────────────────────────────────┐
    │     REAL-TIME TRACKING           │
    │    (Laravel Reverb/Pusher)       │
    └──────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        │                       │
        ▼                       ▼
┌───────────────┐      ┌────────────────┐
│Driver Side    │      │Public Side     │
│               │      │                │
└───────────────┘      └────────────────┘
        │                       │
        ▼                       ▼
┌───────────────┐      ┌────────────────┐
│Update GPS     │      │Subscribe to    │
│Location       │◄─────┤Channel         │
│Every X seconds│ Push │for Barangay    │
└───────────────┘      └────────────────┘
        │                       │
        ▼                       ▼
┌───────────────┐      ┌────────────────┐
│Broadcast:     │      │Receive Updates:│
│• Latitude     │      │• Driver Pos    │
│• Longitude    │      │• Site Status   │
│• Status       │      │• ETA           │
│• Current Site │      │                │
└───────────────┘      └────────────────┘
        │                       │
        ▼                       ▼
┌───────────────┐      ┌────────────────┐
│Database       │      │Map Display     │
│Update         │      │Live Update     │
└───────────────┘      └────────────────┘
```

---

## 8. Geographic Hierarchy

```
        ┌──────────────────┐
        │  MUNICIPALITY    │
        │  (City/Municipal)│
        └──────────────────┘
                 │
         ┌───────┴────────┐
         │                │
         ▼                ▼
    ┌─────────┐      ┌─────────┐
    │Barangay │      │Barangay │
    │(Urban)  │      │(Rural)  │
    └─────────┘      └─────────┘
         │                │
    ┌────┴────┐      ┌────┴────┐
    ▼         ▼      ▼         ▼
┌──────┐  ┌──────┐ ┌──────┐ ┌──────┐
│Purok │  │Purok │ │Purok │ │Purok │
└──────┘  └──────┘ └──────┘ └──────┘
    │         │       │         │
    ▼         ▼       ▼         ▼
┌──────┐  ┌──────┐ ┌──────┐ ┌──────┐
│Sites │  │Sites │ │Sites │ │Sites │
│      │  │      │ │      │ │      │
└──────┘  └──────┘ └──────┘ └──────┘
```

---

## 9. Data Flow Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                     │
│  • Inertia.js  • Mapbox  • Recharts  • SweetAlert2    │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              BACKEND (Laravel 12 + PHP 8.2)             │
│  • Routes  • Controllers  • Models  • Middleware        │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌─────────────┐
│  Database    │  │  Real-time   │  │  External   │
│  (MySQL)     │  │  (Reverb/    │  │  APIs       │
│              │  │   Pusher)    │  │  • OpenAI   │
│  • Users     │  │              │  │  • Mapbox   │
│  • Schedules │  │  • GPS Track │  │             │
│  • Sites     │  │  • Updates   │  │             │
│  • Reports   │  │  • Notifs    │  │             │
│  • Reviews   │  │              │  │             │
└──────────────┘  └──────────────┘  └─────────────┘
```

---

## 10. Complete System Cycle

```
    START
      │
      ▼
┌──────────────┐
│Admin Setup   │
│• Locations   │
│• Drivers     │
│• Trucks      │
└──────────────┘
      │
      ▼
┌──────────────┐
│Create        │
│Schedule      │
└──────────────┘
      │
      ▼
┌──────────────┐
│Driver        │
│Executes      │
│Collection    │
└──────────────┘
      │
      ▼
┌──────────────┐
│Public        │
│Tracks        │
│Progress      │
└──────────────┘
      │
      ▼
┌──────────────┐
│Reports       │
│Generated     │
└──────────────┘
      │
      ▼
┌──────────────┐
│Public        │
│Reviews       │
│Service       │
└──────────────┘
      │
      ▼
┌──────────────┐
│Admin         │
│Analyzes      │
│Data          │
└──────────────┘
      │
      ▼
┌──────────────┐
│Continuous    │
│Improvement   │
└──────────────┘
      │
      └─────► (Cycle Repeats)
```

---

## Key Features Summary

### Admin Functions
- Geographic hierarchy management (Municipality → Barangay → Purok → Sites)
- Driver management (add, assign, verify licenses)
- Schedule creation and assignment
- Fleet management (trucks)
- Review moderation (AI + manual)
- Dashboard analytics

### Driver Functions
- View assigned schedules
- GPS tracking (real-time location updates)
- Collection queue navigation
- Site completion marking
- Report submission (photos, sack counts, garbage types)
- Token-based report validation

### Public User Functions
- View collection schedules by barangay
- Real-time driver location tracking
- Submit reviews and ratings
- View approved feedback
- Check collection routes and sites

### System Features
- Real-time updates (Laravel Reverb/Pusher)
- AI content moderation (OpenAI)
- Interactive mapping (Mapbox)
- Token-based security for reports
- Multi-role authentication
- WebSocket communication

