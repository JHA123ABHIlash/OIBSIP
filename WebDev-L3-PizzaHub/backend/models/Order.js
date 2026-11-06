const mongoose=require('mongoose');

const orderSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    items:[
        {
            pizza:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"Pizza"
            },

            base:{
                type:String,
                required:true,
            },

            sauce: {
                type: String,
                required: true
            },

            cheese: {
                type: String,
                required: true
            },

            vegetables: {
                type: [String]
            },

            quantity: {
                type: Number,
                required: true
            },

            price: {
                type: Number,
                required: true
            }

        }
    ],
    deliveryAddress:{
        fullName:{
            type:String,
            required:true
        },
        phone:{
             type:String,
            required:true
        },
        house:{
             type:String,
            required:true
        },
        street:{
             type:String,
            required:true
        },
        city:{
             type:String,
            required:true
        },
        state:{
             type:String,
            required:true
        },
        pincode:{
             type:String,
            required:true
        }
    },
    totalAmount:{
        type:Number
    },
    paymentStatus:{
        type:String,
        enum:["PENDING","SUCCESS","FAILED"]
    },
    razorpayOrderId:{
        type:String,
    },
    orderStatus:{
        type:String,
        enum:["Order Received","In Kitchen","Sent to Delivery"]
    },
    
deliveryAgent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
},

deliveryStatus: {
    type: String,
    enum: [
        "Unassigned",
        "Assigned",
        "PickedUp",
        "Delivered"
    ],
    default: "Unassigned"
},

},
{ timestamps: true }
);

module.exports=mongoose.model("Order",orderSchema);