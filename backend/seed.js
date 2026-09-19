const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 10);

  // Clean DB
  await prisma.appointment.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.match.deleteMany();
  await prisma.bloodRequest.deleteMany();
  await prisma.bloodInventory.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.donation.deleteMany();
  await prisma.donor.deleteMany();
  await prisma.hospital.deleteMany();
  await prisma.bloodBank.deleteMany();
  await prisma.recipient.deleteMany();
  await prisma.organDonor.deleteMany();
  await prisma.organRequest.deleteMany();
  await prisma.user.deleteMany();

  // Create Admin
  await prisma.user.create({
    data: { email: 'admin@demo.com', password, role: 'ADMIN', name: 'System Admin' }
  });

  // Create Hospital
  const hospUser = await prisma.user.create({
    data: { email: 'hospital@demo.com', password, role: 'HOSPITAL', name: 'City Hospital' }
  });
  await prisma.hospital.create({
    data: { userId: hospUser.id, isVerified: true, city: 'New York', latitude: 40.7128, longitude: -74.0060 }
  });

  // Create Blood Bank
  const bbUser = await prisma.user.create({
    data: { email: 'bloodbank@demo.com', password, role: 'BLOOD_BANK', name: 'Central Blood Bank' }
  });
  const bb = await prisma.bloodBank.create({
    data: { userId: bbUser.id, isVerified: true, city: 'New York', latitude: 40.7138, longitude: -74.0070 }
  });
  
  await prisma.bloodInventory.createMany({
    data: [
      { bloodBankId: bb.id, bloodGroup: 'A_POS', units: 15 },
      { bloodBankId: bb.id, bloodGroup: 'O_NEG', units: 5, expiryDate: new Date(Date.now()+45*86400000), storageCondition: '2–6°C' },
      { bloodBankId: bb.id, bloodGroup: 'B_POS', units: 10, expiryDate: new Date(Date.now()+20*86400000), storageCondition: '2–6°C' }
    ]
  });

  // Create Recipient
  const recUser = await prisma.user.create({
    data: { email: 'recipient@demo.com', password, role: 'RECIPIENT', name: 'Demo Recipient' }
  });
  await prisma.recipient.create({ data: { userId: recUser.id, bloodGroup: 'O_NEG', city: 'New York' } });

  // Create Donors
  const donorUser = await prisma.user.create({
    data: { email: 'donor@demo.com', password, role: 'DONOR', name: 'John Donor' }
  });
  const donor = await prisma.donor.create({
    data: { userId: donorUser.id, bloodGroup: 'O_NEG', eligibility: 'ELIGIBLE', city: 'New York', latitude: 40.7150, longitude: -74.0080 }
  });
  await prisma.donor.create({data:{userId:(await prisma.user.create({data:{email:'donor2@demo.com',password,role:'DONOR',name:'Alex Donor'}})).id,bloodGroup:'O_NEG',eligibility:'ELIGIBLE',city:'New York',latitude:40.716,longitude:-74.009}});
  await prisma.appointment.create({data:{donorId:donor.id,bloodBankId:bb.id,scheduledAt:new Date(Date.now()+3*86400000),status:'BOOKED'}});

  console.log('Seed data created successfully! Demo credentials (password: password123):');
  console.log('admin@demo.com | hospital@demo.com | bloodbank@demo.com | donor@demo.com | recipient@demo.com');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
