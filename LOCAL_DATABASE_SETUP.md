# Local Database Setup Guide

This guide will help you migrate your SmartUniit application from Supabase to a local PostgreSQL database.

## Prerequisites

1. **Docker Desktop** installed and running
2. **Node.js** and **npm** installed
3. **Git** for version control

## Step 1: Set Up Local PostgreSQL Database

### Option A: Using Docker (Recommended)

1. **Start Docker Desktop** on your machine
2. **Run the setup script**:
   ```bash
   # On Windows
   setup-local-db.bat
   
   # On Linux/Mac
   chmod +x setup-local-db.sh
   ./setup-local-db.sh
   ```

### Option B: Manual PostgreSQL Installation

1. **Download PostgreSQL** from https://www.postgresql.org/download/
2. **Install PostgreSQL** with these settings:
   - Port: 5432
   - Username: postgres
   - Password: smartuniit123
   - Database: smartuniit_db
3. **Run the SQL script**:
   ```bash
   psql -U postgres -d smartuniit_db -f setup-local-db.sql
   ```

## Step 2: Database Configuration

### Database Details
- **Host**: localhost (192.168.1.30)
- **Port**: 5432
- **Database**: smartuniit_db
- **Username**: postgres
- **Password**: smartuniit123
- **Connection URL**: `postgresql://postgres:smartuniit123@localhost:5432/smartuniit_db`

### Default Super Admin User
- **Email**: admin@smartuniit.com
- **Role**: super_admin
- **User ID**: cc0a8939-fedb-45c6-b623-b2699162a600

## Step 3: Application Configuration

### Option A: Use Local Database Client (Recommended)

1. **Import the local database client**:
   ```typescript
   import { localDB, testConnection } from '@/integrations/local-db/client';
   ```

2. **Test the connection**:
   ```typescript
   // In your main.tsx or App.tsx
   import { initializeDB } from '@/integrations/local-db/client';
   
   // Initialize database connection
   initializeDB();
   ```

3. **Update your hooks** to use the local database client instead of Supabase.

### Option B: Environment Variables

Create a `.env.local` file:
```env
# Local Database Configuration
VITE_DB_HOST=localhost
VITE_DB_PORT=5432
VITE_DB_NAME=smartuniit_db
VITE_DB_USER=postgres
VITE_DB_PASSWORD=smartuniit123

# Use local database instead of Supabase
VITE_USE_LOCAL_DB=true
```

## Step 4: Database Schema

The local database includes all the tables from your Supabase schema:

### Core Business Tables
- `profiles` - User profiles
- `customers` - Customer management
- `projects` - Project management
- `tasks` - Task tracking
- `quotations` - Quotation system
- `quotation_sections` - Quotation sections
- `quotation_line_items` - Quotation line items
- `follow_ups` - Customer follow-ups

### Proposal System Tables
- `proposals` - Main proposal data
- `proposal_budget_items` - Budget items
- `proposal_case_studies` - Case studies
- `proposal_commercial_items` - Commercial items
- `proposal_deliverables` - Deliverables
- `proposal_timeline` - Project timeline
- `proposal_versions` - Version control

### Invoice System Tables
- `invoices` - Invoice management
- `invoice_line_items` - Invoice line items

### System Tables
- `user_roles` - Role-based access control
- `role_permissions` - Permission mapping
- `data_backups` - Backup system
- `error_logs` - Error tracking

## Step 5: Role-Based Access Control (RBAC)

The local database includes a complete RBAC system with 5 roles:

1. **super_admin** - Full system access
2. **admin** - Administrative privileges
3. **manager** - Management level access
4. **employee** - Standard user access
5. **viewer** - Read-only access

### Default Permissions
All role permissions are pre-configured in the database setup script.

## Step 6: Testing the Setup

1. **Test database connection**:
   ```typescript
   import { testConnection } from '@/integrations/local-db/client';
   
   const isConnected = await testConnection();
   console.log('Database connected:', isConnected);
   ```

2. **Test authentication**:
   - Login with the default super admin user
   - Verify role-based permissions work

3. **Test core functionality**:
   - Create a customer
   - Create a quotation
   - Create a proposal
   - Generate PDF exports

## Step 7: Data Migration (Optional)

If you want to migrate existing data from Supabase:

1. **Export data from Supabase**:
   ```sql
   -- Export each table
   COPY (SELECT * FROM customers) TO '/path/to/customers.csv' CSV HEADER;
   ```

2. **Import to local database**:
   ```sql
   -- Import each table
   COPY customers FROM '/path/to/customers.csv' CSV HEADER;
   ```

## Troubleshooting

### Common Issues

1. **Docker not running**:
   - Start Docker Desktop
   - Wait for it to fully initialize

2. **Port 5432 already in use**:
   - Stop other PostgreSQL instances
   - Change the port in the setup script

3. **Connection refused**:
   - Check if PostgreSQL container is running: `docker ps`
   - Restart the container: `docker restart smartuniit-postgres`

4. **Permission denied**:
   - Ensure you're using the correct credentials
   - Check if the database exists

### Useful Commands

```bash
# Check Docker containers
docker ps

# View container logs
docker logs smartuniit-postgres

# Connect to database
docker exec -it smartuniit-postgres psql -U postgres -d smartuniit_db

# Stop and remove container
docker stop smartuniit-postgres
docker rm smartuniit-postgres
```

## Security Considerations

1. **Change default passwords** in production
2. **Use environment variables** for sensitive data
3. **Enable SSL** for database connections
4. **Restrict network access** to the database
5. **Regular backups** of your local database

## Next Steps

1. **Update your application** to use the local database
2. **Test all functionality** thoroughly
3. **Set up automated backups**
4. **Configure monitoring** and logging
5. **Deploy to production** when ready

## Support

If you encounter issues:
1. Check the troubleshooting section
2. Review the database logs
3. Verify all prerequisites are met
4. Test with a simple connection first

---

**Note**: This setup is for development purposes. For production, consider using a managed PostgreSQL service or proper server setup with security best practices. 