const mongoose=require('mongoose');

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        trim:true,
        required:true
    },
    email:{
        type:String,
        trim:true,
        required:true,
        unique: true
    },
     phone:{
        type:String,
        trim:true,
        required:true,
        unique: true
    },
    password:{
        type:String,
        trim:true,
        required:true
    },
    role: {
    type: String,
    enum: ["Admin", "User", "DeliveryAgent"],
    default: "User"
},
    isVerified:{
        type:Boolean,
        default: false,
    },
    resetToken:{
        type:String
    },
    resetTokenExpires:{
        type:Date
    },
    isAvailable: {
    type: Boolean,
    default: true
},

currentLocation: {
    latitude: {
        type: Number,
        default: null
    },
    longitude: {
        type: Number,
        default: null
    },
    updatedAt: {
        type: Date,
        default: null
    }
},
})

module.exports=mongoose.model("User",userSchema);