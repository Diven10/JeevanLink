const express=require('express'); const prisma=require('../prismaClient'); const {authenticate,authorize}=require('../middlewares/auth');
const router=express.Router();
router.get('/me',authenticate,authorize('HOSPITAL'),async(req,res)=>{try{const h=await prisma.hospital.findUnique({where:{userId:req.user.id},include:{user:true}});res.json(h)}catch(e){res.status(500).json({error:'Server error'})}});
router.put('/me',authenticate,authorize('HOSPITAL'),async(req,res)=>{try{const h=await prisma.hospital.update({where:{userId:req.user.id},data:{address:req.body.address,city:req.body.city,latitude:req.body.latitude?+req.body.latitude:null,longitude:req.body.longitude?+req.body.longitude:null}});res.json(h)}catch(e){res.status(500).json({error:'Server error'})}});
module.exports=router;