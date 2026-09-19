# JeevanLink — Smart Blood Bank & Organ Donation Management System

A React + Express + MySQL/Prisma academic MVP implementing the documented JeevanLink workflow.

## Implemented panels
- Public landing page
- Find Blood
- Awareness & FAQ
- Login / registration
- Donor dashboard, profile, eligibility, donation history, appointments, notifications
- Recipient dashboard and blood requests
- Hospital dashboard, blood requests and emergency request flow
- Blood Bank dashboard and inventory
- Admin dashboard, users, verification and audit foundation
- Organ donor registration and hospital potential matching

## Core demo flow
Hospital → Emergency Blood Request → compatibility matching → donor notification → donor accepts → hospital sees updated status.

## Technology
- React + Vite
- Bootstrap + custom CSS
- Node.js + Express
- MySQL + Prisma
- JWT + bcrypt
- Lucide icons

## Run locally

### Backend
```bash
cd backend
npm install
# create .env with DATABASE_URL and JWT_SECRET
npx prisma generate
npx prisma migrate dev --name jeevanlink_final
node seed.js
node index.js
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Backend defaults to `http://localhost:5000`; frontend defaults to Vite's development port.

## Demo accounts
Password: `password123`

- admin@demo.com
- hospital@demo.com
- bloodbank@demo.com
- donor@demo.com
- donor2@demo.com
- recipient@demo.com

## Important scope note
Organ results are **potential matches only** and require medical/legal review. The application does not perform final organ allocation. Exact medical eligibility thresholds are intentionally configurable because the project SRS marks them TBD.

## Final status
This package is a submission-oriented academic MVP. Before a live demonstration, run the Prisma migration/seed against your MySQL instance and verify the emergency workflow end-to-end.
