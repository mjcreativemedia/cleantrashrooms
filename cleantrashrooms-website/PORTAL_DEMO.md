# CleanTrashRooms Portal System - Demo Guide

## 🎯 Functional Portal Features

### ✅ Portal Admin (`/portal`)
**For technicians and management:**
- **Submit Service Log**: Complete form with file uploads
  - Client ID and Name fields
  - Technician name
  - Service type dropdown (Daily Clean, End of Day, Haul Away, Deep Clean)
  - Before/After photo uploads
  - Service notes textarea
  - Functional form submission with API integration

- **View All Service History**: Comprehensive filtering system
  - Filter by client, date range, service type, technician
  - Shows all service logs with before/after photos
  - Service details: date, time, technician, client name
  - Completed status badges
  - Export functionality

- **Schedule Service**: Service request form
  - Client selection
  - Request type dropdown
  - Date/time preferences
  - Details textarea

### ✅ Private Client Portals (`/portal/[client-id]`)
**For individual clients:**
- Private URL structure: `/portal/sunset-towers`, `/portal/oak-gardens`, etc.
- Client-specific service history
- Before/after photo documentation
- Service notes and details
- Download service reports
- Access control (shows "Access Denied" for unauthorized access)

## 🔧 Backend API Endpoints

### Service Logs
- `POST /api/service-logs` - Submit new service log with photo uploads
- `GET /api/service-logs` - Get all service logs with filtering
- `GET /api/service-logs/:id` - Get specific service log

### Client Management  
- `GET /api/clients` - Get all clients
- `GET /api/portal/:clientId` - Get client-specific portal data

### Service Requests
- `POST /api/service-requests` - Create service requests
- `GET /api/service-requests` - Get service requests

## 📊 Data Structure

### ServiceLog Interface
```typescript
interface ServiceLog {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  time: string;
  technician: string;
  serviceType: 'Daily Clean' | 'End of Day' | 'Haul Away' | 'Deep Clean';
  beforePhoto: string;
  afterPhoto: string;
  notes: string;
  createdAt: string;
}
```

## 🔗 Example URLs

### Public Access
- Main website: `/`
- Services: `/services`
- Contact: `/contact`
- Blog: `/blog`

### Portal Access
- Admin Portal: `/portal` (for technicians and management)
- Sunset Towers: `/portal/sunset-towers` (private client access)
- Oak Gardens: `/portal/oak-gardens` (private client access)

## 🚀 Key Features Implemented

✅ **File Upload Handling**: Before/after photos with FormData
✅ **Real-time Filtering**: By client, date, service type, technician
✅ **Private URLs**: Client-specific portals not publicly linked
✅ **Structured Data**: Proper service log database with all required fields
✅ **Access Control**: Private portals require specific client access
✅ **Form Validation**: Required fields and proper error handling
✅ **Photo Documentation**: Side-by-side before/after display
✅ **Export Functionality**: Download service reports

## 📱 Responsive Design
- Works on desktop, tablet, and mobile devices
- Clean, professional interface matching the cleaning service brand
- Easy navigation between admin and client views

## 💡 Usage Instructions

### For Technicians:
1. Go to `/portal`
2. Fill out service completion form
3. Upload before/after photos
4. Submit service notes
5. View service history with filters

### For Clients:
1. Access private URL (provided by CleanTrashRooms)
2. View service history for their property
3. See before/after photos of each service
4. Download service reports
5. Contact for additional services

The system is fully functional with a robust backend API, file handling, and client-specific access control.