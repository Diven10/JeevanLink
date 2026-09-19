const express = require('express');
const prisma = require('../prismaClient');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

router.get('/me', authenticate, async(req,res)=>{
  try { const record=await prisma.organDonor.findUnique({where:{userId:req.user.id}}); if(!record)return res.status(404).json({error:'Not registered'}); res.json(record); }
  catch(e){res.status(500).json({error:'Server error'})}
});
router.put('/me', authenticate, async(req,res)=>{
  try { const record=await prisma.organDonor.findUnique({where:{userId:req.user.id}}); if(!record)return res.status(404).json({error:'Not registered'}); res.json(await prisma.organDonor.update({where:{id:record.id},data:{bloodGroup:req.body.bloodGroup,organs:req.body.organs,medicalHistory:req.body.medicalHistory,emergencyContact:req.body.emergencyContact,consent:req.body.consent!==false,withdrawnAt:req.body.withdrawn?new Date():null}})); }
  catch(e){res.status(500).json({error:'Server error'})}
});
// Register as organ donor
router.post('/register', authenticate, async (req, res) => {
  const { bloodGroup, organs, medicalHistory, emergencyContact, consent } = req.body;
  try {
    if (!consent) return res.status(400).json({error:'Explicit digital consent is required'});
    const organDonor = await prisma.organDonor.create({
      data: {
        userId: req.user.id,
        bloodGroup,
        organs, medicalHistory: medicalHistory||null, emergencyContact: emergencyContact||null, consent:true
      }
    });
    res.status(201).json({ organDonor, message: 'Successfully registered as an organ donor.' });
  } catch (error) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Already registered as organ donor' });
    res.status(500).json({ error: 'Server error' });
  }
});

// Hospital creates organ request
router.post('/requests', authenticate, authorize('HOSPITAL'), async (req, res) => {
  const { organType, bloodGroup, urgency } = req.body;
  try {
    const hospital = await prisma.hospital.findUnique({ where: { userId: req.user.id } });
    const request = await prisma.organRequest.create({
      data: {
        hospitalId: hospital.id,
        organType,
        bloodGroup,
        urgency,
        status: 'PENDING'
      }
    });

    // Find potential matches (simplified logic for MVP)
    const potentialDonors = await prisma.organDonor.findMany({
      where: {
        bloodGroup,
        organs: { contains: organType }
      },
      include: { user: true }
    });

    res.status(201).json({
      request,
      message: `Organ request created. Found ${potentialDonors.length} potential matches. Requires Medical/Legal Review.`,
      potentialMatches: potentialDonors.map(d => ({ id: d.id, name: d.user.name, bloodGroup: d.bloodGroup }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
