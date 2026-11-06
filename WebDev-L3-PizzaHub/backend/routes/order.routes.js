const express = require("express");

const router = express.Router();

const { createOrder,getUserOrders,getOrderById,createRazorpayOrder,verifyPayment,getAllOrders,updateOrderStatus } = require("../controllers/order.controller");

const { auth } = require("../middleware/auth");
const {isAdmin}=require('../middleware/admin');


router.post("/create-order", auth, createOrder);
router.get('/get-user-order',auth,getUserOrders);
router.get('/get-order/:orderId',auth,getOrderById);
router.post('/create-razorpay-order',auth,createRazorpayOrder);
router.post('/verify-payment',auth,verifyPayment);
router.get('/get-all-order',auth,isAdmin,getAllOrders);
router.put('/update-order-status/:orderId',auth,isAdmin,updateOrderStatus);


module.exports = router;