# 🐘 Native PostgreSQL Setup Guide (Without Docker)

This guide walks you through setting up **PostgreSQL** natively on Windows without using Docker.

---

## Step 1: Install PostgreSQL on Windows (If not installed)

1. Download the official PostgreSQL installer for Windows from:  
   👉 **https://www.postgresql.org/download/windows/**
2. Run the installer and keep default settings:
   - **Port**: `5432` (Default)
   - **Superuser**: `postgres`
   - **Password**: Set a password you will remember (e.g., `postgres` or `admin123`)
3. Finish installation. **pgAdmin 4** and **SQL Shell (psql)** will now be available in your Windows Start Menu.

---

## Step 2: Create the `careerforge` Database

### Method A: Using SQL Shell (psql)
1. Open **SQL Shell (psql)** from Windows Start Menu.
2. Press `Enter` for Server, Database, Port, and Username defaults (`localhost`, `postgres`, `5432`, `postgres`).
3. Type your PostgreSQL password when prompted.
4. Run the SQL command:
   ```sql
   CREATE DATABASE careerforge;
   ```
5. Type `\q` to exit.

### Method B: Using pgAdmin 4 (GUI)
1. Open **pgAdmin 4** from Windows Start Menu.
2. Right-click on **Databases** -> **Create** -> **Database...**
3. Enter Database name: `careerforge` and click **Save**.

---

## Step 3: Update `.env` File

Open `.env` in the root of your project workspace and update `DATABASE_URL`:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/careerforge?schema=public"
```

> **Example**: If your password is `admin123`, it should be:  
> `DATABASE_URL="postgresql://postgres:admin123@localhost:5432/careerforge?schema=public"`

---

## Step 4: Sync Schema & Create Tables with Prisma

In your project root terminal, run:

```bash
# 1. Generate Prisma Client JavaScript bindings
npx prisma generate --schema=prisma/schema.prisma

# 2. Automatically create all PostgreSQL tables
npx prisma db push --schema=prisma/schema.prisma
```

Output should show:
```text
🚀 Your database is now in sync with your Prisma schema.
```

---

## Step 5: Start CareerForge

```bash
# Start Backend Express API (Port 5000)
npm run dev:server

# Start Frontend React App (Port 3000)
npm run dev:client
```
