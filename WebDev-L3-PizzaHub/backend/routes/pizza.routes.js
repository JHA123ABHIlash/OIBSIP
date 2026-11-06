const express=require('express');
const router=express.Router();


const {createPizza, getAllPizzas, getPizzaById, updatePizza, deletePizza}=require('../controllers/pizza.controller');
const {auth}=require('../middleware/auth');
const {isAdmin}=require('../middleware/admin');


router.post('/create-pizza',auth,isAdmin,createPizza);
router.get('/get-all-pizza',getAllPizzas);
router.get("/get-pizza/:pizzaId",getPizzaById);
router.put('/update-pizza/:pizzaId',auth,isAdmin,updatePizza);
router.delete('/delete-pizza/:pizzaId',auth,isAdmin,deletePizza);

module.exports=router;