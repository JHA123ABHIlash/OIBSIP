const express=require('express');
const router=express.Router();

const {createInventory,getAllInventory,updateInventory,deleteInventory}=require('../controllers/inventory.controller');
const {auth}=require('../middleware/auth');
const {isAdmin}=require('../middleware/admin');


router.post('/create-inventory',auth,isAdmin,createInventory);
router.get('/get-all-inventory',auth,isAdmin,getAllInventory);
router.put('/update-inventory/:inventoryId',auth,isAdmin,updateInventory);
router.delete('/delete-inventory/:inventoryId',auth,isAdmin,deleteInventory);


module.exports=router;
