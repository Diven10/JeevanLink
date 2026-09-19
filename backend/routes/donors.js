const express=require('express');
const prisma=require('../prismaClient');
const {authenticate,authorize}=require('../middlewares/auth');
const router=express.Router();

router.get('/me',authenticate,authorize('DONOR'),async(req,res)=>{
 try{
  const d=await prisma.donor.findUnique({
   where:{userId:req.user.id},
   include:{
    user:true,
    donations:{orderBy:{date:'desc'}},
    appointments:{include:{bloodBank:{include:{user:true}}},orderBy:{scheduledAt:'asc'}},
    matches:{include:{bloodRequest:{include:{hospital:{include:{user:true}}}}},orderBy:{createdAt:'desc'}}
   }
  });
  res.json(d);
 }catch(e){res.status(500).json({error:'Server error'})}
});
router.put('/me',authenticate,authorize('DONOR'),async(req,res)=>{
 try{
  const d=await prisma.donor.update({where:{userId:req.user.id},data:{
   city:req.body.city,address:req.body.address,
   latitude:req.body.latitude===''?null:Number(req.body.latitude),
   longitude:req.body.longitude===''?null:Number(req.body.longitude),
   eligibility:req.body.eligibility||undefined
  }});
  res.json(d);
 }catch(e){res.status(500).json({error:'Server error'})}
});
router.post('/donations',authenticate,authorize('DONOR'),async(req,res)=>{
 try{
  const d=await prisma.donor.findUnique({where:{userId:req.user.id}});
  if(!d)return res.status(404).json({error:'Donor not found'});
  const donation=await prisma.donation.create({data:{donorId:d.id,units:Math.max(1,Number(req.body.units)||1),location:req.body.location||null}});
  await prisma.donor.update({where:{id:d.id},data:{donationCount:{increment:1},lastDonation:donation.date}});
  res.status(201).json(donation);
 }catch(e){res.status(500).json({error:'Server error'})}
});
router.get('/appointments',authenticate,authorize('DONOR'),async(req,res)=>{
 try{const d=await prisma.donor.findUnique({where:{userId:req.user.id}});res.json(await prisma.appointment.findMany({where:{donorId:d.id},include:{bloodBank:{include:{user:true}}},orderBy:{scheduledAt:'asc'}}))}
 catch(e){res.status(500).json({error:'Server error'})}
});
router.post('/appointments',authenticate,authorize('DONOR'),async(req,res)=>{
 try{
  const d=await prisma.donor.findUnique({where:{userId:req.user.id}});
  if(d.eligibility!=='ELIGIBLE')return res.status(400).json({error:'Donor is not currently eligible'});
  const a=await prisma.appointment.create({data:{donorId:d.id,bloodBankId:req.body.bloodBankId,scheduledAt:new Date(req.body.scheduledAt),notes:req.body.notes||null}});
  await prisma.notification.create({data:{userId:req.user.id,title:'Appointment Confirmed',message:'Your blood donation appointment has been booked.',link:'/donor/appointments'}});
  res.status(201).json(a);
 }catch(e){res.status(500).json({error:'Could not book appointment'})}
});
router.put('/appointments/:id',authenticate,authorize('DONOR'),async(req,res)=>{
 try{
  const d=await prisma.donor.findUnique({where:{userId:req.user.id}});
  const a=await prisma.appointment.findUnique({where:{id:req.params.id}});
  if(!a||a.donorId!==d.id)return res.status(403).json({error:'Forbidden'});
  const data=req.body.action==='CANCEL'?{status:'CANCELLED'}:{scheduledAt:new Date(req.body.scheduledAt)};
  res.json(await prisma.appointment.update({where:{id:a.id},data}));
 }catch(e){res.status(500).json({error:'Could not update appointment'})}
});
module.exports=router;
