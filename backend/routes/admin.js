const express = require('express');
const prisma = require('../prismaClient');
const { authenticate, authorize } = require('../middlewares/auth');
const router = express.Router();

router.get('/stats', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const totalDonors = await prisma.donor.count();
    const totalHospitals = await prisma.hospital.count();
    const totalBloodBanks = await prisma.bloodBank.count();
    const totalRequests = await prisma.bloodRequest.count();
    const emergencyRequests = await prisma.bloodRequest.count({ where: { urgency: 'EMERGENCY' } });
    
    const totalRecipients=await prisma.recipient.count(); const donations=await prisma.donation.count(); const inventory=await prisma.bloodInventory.aggregate({ _sum:{units:true} });
    res.json({ totalDonors, totalHospitals, totalBloodBanks, totalRecipients, totalRequests, emergencyRequests, donations, totalUnits: inventory._sum.units || 0 });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/users', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

router.get('/verifications', authenticate, authorize('ADMIN'), async (req,res)=>{
 try {
  const [hospitals,banks]=await Promise.all([
   prisma.hospital.findMany({where:{isVerified:false},include:{user:{select:{id:true,name:true,email:true}}}}),
   prisma.bloodBank.findMany({where:{isVerified:false},include:{user:{select:{id:true,name:true,email:true}}}})
  ]); res.json({hospitals,banks});
 } catch(e){res.status(500).json({error:'Server error'})}
});
router.put('/verification/:type/:id', authenticate, authorize('ADMIN'), async(req,res)=>{
 try {
  const type=req.params.type; const verified=req.body.verified !== false;
  let result;
  if(type==='hospital') result=await prisma.hospital.update({where:{id:req.params.id},data:{isVerified:verified}});
  else if(type==='blood-bank') result=await prisma.bloodBank.update({where:{id:req.params.id},data:{isVerified:verified}});
  else return res.status(400).json({error:'Invalid verification type'});
  await prisma.auditLog.create({data:{userId:req.user.id,action:verified?'VERIFY':'SUSPEND',entity:type,entityId:req.params.id}});
  res.json(result);
 }catch(e){res.status(500).json({error:'Server error'})}
});
router.get('/audit-logs', authenticate, authorize('ADMIN'), async(req,res)=>{
 try{res.json(await prisma.auditLog.findMany({include:{user:{select:{name:true,email:true}}},orderBy:{createdAt:'desc'},take:100}))}catch(e){res.status(500).json({error:'Server error'})}
});
