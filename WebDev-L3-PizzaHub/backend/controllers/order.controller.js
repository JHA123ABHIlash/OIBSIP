const Order = require("../models/Order");
const Pizza = require("../models/Pizza");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Inventory = require("../models/Inventory");
const { getIO } = require("../utils/socket");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = async (req, res) => {
  try {
    const { items,deliveryAddress } = req.body;

    // Validate items
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order items are required.",
      });
    }

    let totalAmount = 0;
    const orderItems = [];

    const requiredIngredients = new Map();

    const addIngredient = (category, name, quantity) => {
      const key = `${category}:${name}`;

      requiredIngredients.set(
        key,
        (requiredIngredients.get(key) || 0) + quantity,
      );
    };

    for (const item of items) {
      const { pizza, base, sauce, cheese, vegetables, quantity } = item;

      // Validate required fields
      if (!pizza || !base || !sauce || !cheese || !quantity) {
        return res.status(400).json({
          success: false,
          message: "Required pizza details are missing.",
        });
      }

      // Validate quantity
      if (!Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: "Quantity must be a positive integer.",
        });
      }

      // Get pizza from database
      const pizzaDetails = await Pizza.findById(pizza);

      if (!pizzaDetails) {
        return res.status(404).json({
          success: false,
          message: "Pizza not found.",
        });
      }

      // Backend price
      const itemPrice = pizzaDetails.price;
      const itemTotal = itemPrice * quantity;

      totalAmount += itemTotal;

      orderItems.push({
        pizza: pizzaDetails._id,
        base,
        sauce,
        cheese,
        vegetables: vegetables || [],
        quantity,
        price: itemPrice,
      });

      addIngredient("base", base, quantity);
      addIngredient("sauce", sauce, quantity);
      addIngredient("cheese", cheese, quantity);

      for (const vegetable of vegetables || []) {
        addIngredient("vegetable", vegetable, quantity);
      }
    }

    // Address validation

    if (
  !deliveryAddress ||
  typeof deliveryAddress !== "object" ||
  Array.isArray(deliveryAddress)
) {
  return res.status(400).json({
    success: false,
    message: "Please provide a valid delivery address.",
  });
}
    
      const { fullName, phone, house, street, city, state, pincode} = deliveryAddress;

      // Validate required fields
      if (!fullName || !phone || !house || !street || !city || !state || !pincode) {
        return res.status(400).json({
          success: false,
          message: "Required Delivery Address are missing.",
        });
      }

      if(fullName.trim().length===0){
        return res.status(400).json({
          success: false,
          message: "Please Enter Your Name.",
        });
      }

       if(phone.trim().length===0){
        return res.status(400).json({
          success: false,
          message: "Please Enter Your phone Number.",
        });
      }

       if(house.trim().length===0){
        return res.status(400).json({
          success: false,
          message: "Please Enter Your House Name.",
        });
      }

       if(street.trim().length===0){
        return res.status(400).json({
          success: false,
          message: "Please Enter Your Street Name.",
        });
      }

       if(city.trim().length===0){
        return res.status(400).json({
          success: false,
          message: "Please Enter Your City Name.",
        });
      }

       if(state.trim().length===0){
        return res.status(400).json({
          success: false,
          message: "Please Enter Your State Name.",
        });
      }

       if(pincode.trim().length===0){
        return res.status(400).json({
          success: false,
          message: "Please Enter Your Pincode.",
        });
      }

      // phone and pincode verification.
      let phoneRegex=/^[6-9]\d{9}$/;
      let pincodeRegex=/^\d{6}$/;

      if(!phoneRegex.test(phone.trim())){
        return res.status(400).json({
          success: false,
          message: "Please Enter correct Mobile Number.",
        });
      }

      if(!pincodeRegex.test(pincode.trim())){
        return res.status(400).json({
          success: false,
          message: "Please Enter correct Pincode .",
        });
      }

    // check Inventory Status.
    for (const [key, requiredQuantity] of requiredIngredients) {
      const [category, name] = key.split(":");

      const inventory = await Inventory.findOne({
        category,
        name,
      });

      if (!inventory) {
        return res.status(404).json({
          success: false,
          message: `${name} is not available in inventory.`,
        });
      }

      if (inventory.quantity < requiredQuantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${inventory.quantity} ${name} items are available in stock.`,
        });
      }
    }

    // Create order
    const order = await Order.create({
      
      user: req.user.id,
      deliveryAddress:deliveryAddress,
      items: orderItems,
      totalAmount: totalAmount,
      paymentStatus: "PENDING",
      orderStatus: "Order Received",
    });

    return res.status(201).json({
      success: true,
      order,
      message: "Order created successfully.",
    });
  } catch (error) {
    console.error("Create Order Error:", error);

    return res.status(500).json({
      success: false,
      message: "Error while creating order.",
    });
  }
};



// Get Order.
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.find({ user: userId })
  .populate("deliveryAgent", "name email phone")
  .sort({ createdAt: -1 });

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No orders found.",
      });
    }

    return res.status(200).json({
      success: true,
      orders,
      message: "Orders fetched successfully.",
    });
  } catch (error) {
    console.error("Get User Orders Error:", error);

    return res.status(500).json({
      success: false,
      message: "Error while fetching orders.",
    });
  }
};


// Get Order By Id.
exports.getOrderById = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const userId = req.user.id;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required.",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    }).populate("items.pizza");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    return res.status(200).json({
      success: true,
      order,
      message: "Order fetched successfully.",
    });
  } catch (error) {
    console.error("Get Order By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Error while fetching order.",
    });
  }
};

exports.createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required.",
      });

    }

    // Find user's order
    const order = await Order.findOne({
      _id: orderId,
      user: req.user.id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    // Don't create payment for already paid order
    if (order.paymentStatus === "SUCCESS") {
      return res.status(400).json({
        success: false,
        message: "Order is already paid.",
      });
    }

    // Razorpay amount is in paise
    const options = {
      amount: Math.round(order.totalAmount * 100),
      currency: "INR",
      receipt: order._id.toString(),
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Save Razorpay order ID
    order.razorpayOrderId = razorpayOrder.id;

    await order.save();

    return res.status(200).json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
      message: "Razorpay order created successfully.",
    });
  } catch (error) {
    console.error("Razorpay Order Error:", error);

    return res.status(500).json({
      success: false,
      message: "Error while creating Razorpay order.",
    });
  }
};



// Verify Payment
exports.verifyPayment = async (req, res) => {
  try {
    //take order_id,payment_id,signature.
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment details are required.",
      });
    }

    // Find the order belonging to logged-in user
    const order = await Order.findOne({
      razorpayOrderId: razorpay_order_id,
      user: req.user.id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    // Prevent duplicate inventory deduction
    if (order.paymentStatus === "SUCCESS") {
      return res.status(200).json({
        success: true,
        message: "Payment already verified.",
        order,
      });
    }

    // Generate signature
    const body =
      razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(body)
      .digest("hex");

    // Compare signatures
    if (expectedSignature !== razorpay_signature) {
      order.paymentStatus = "FAILED";

      await order.save();

      return res.status(400).json({
        success: false,
        message: "Payment verification failed.",
      });
    }

    // Build required ingredients
    const requiredIngredients = new Map();

    const addIngredient = (category, name, quantity) => {
      const key = `${category}:${name}`;

      requiredIngredients.set(
        key,
        (requiredIngredients.get(key) || 0) + quantity
      );
    };

    for (const item of order.items) {
      addIngredient("base", item.base, item.quantity);
      addIngredient("sauce", item.sauce, item.quantity);
      addIngredient("cheese", item.cheese, item.quantity);

      for (const vegetable of item.vegetables || []) {
        addIngredient(
          "vegetable",
          vegetable,
          item.quantity
        );
      }
    }

   
    // PHASE 1: CHECK ALL INVENTORY
    const inventoryItems = [];

    for (const [key, requiredQuantity] of requiredIngredients) {
      const [category, name] = key.split(":");

      const inventory = await Inventory.findOne({
        category,
        name,
      });

      if (!inventory) {
        return res.status(400).json({
          success: false,
          message: `${name} is not available in inventory.`,
        });
      }

      if (inventory.quantity < requiredQuantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${inventory.quantity} ${name} items are available in stock.`,
        });
      }

      inventoryItems.push({
        inventory,
        requiredQuantity,
      });
    }

    // PHASE 2: DEDUCT INVENTORY
    for (const { inventory, requiredQuantity } of inventoryItems) {
      inventory.quantity -= requiredQuantity;


      await inventory.save();
    }

    // Payment verified
    order.paymentStatus = "SUCCESS";

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully.",
      order,
    });
  } catch (error) {
    console.error(
      "Payment Verification Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Error while verifying payment.",
    });
  }
};



//Get All Orders.
exports.getAllOrders =async(req,res)=>{
  try {
    // Get Order.
    const orders=await Order.find().populate("items.pizza").sort({ createdAt: -1 });

    if(orders.length===0){
      return res.status(400).json({
        success:false,
        message:"Order not found."
      })
    }

    //send res
    res.status(200).json({
      success:true,
      orders,
      message:"Order get successfully."
    })

  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success:false,
      message:`Error comes while geting orders,${error.message}`
    })
  }
}


//Update Order Status
exports.updateOrderStatus=async(req,res)=>{
  try {
    //get data.
    const orderId=req.params.orderId;
    const {status}=req.body;

    //check status 
    if(status !=="Order Received" && status !=="In Kitchen" && status !=="Sent to Delivery"){
      return res.status(400).json({
        success:false,
        message:"Please Enter valid Status."
      })
    }

    //get order
    const orders=await Order.findById(orderId);

    // Validate order.
    if(!orders){
      return res.status(404).json({
        success:false,
        message:"Order not found."
      })
    }
      //get order and update their status.
    const order=await Order.findByIdAndUpdate(orderId,
      {orderStatus:status},
      {
        new:true
      }
    )
const io = getIO();

io.to(`order_${orderId}`).emit("orderStatusUpdated", {
  orderId: order._id,
  status: order.orderStatus,
});
    //send response
    return res.status(200).json({
      success:true,
      order,
      message:"Order status updated successfully."
    })
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success:false,
      message:`Error comes while Update Order ${error.message}`
    });
  }
}