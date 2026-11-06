const mongoose=require('mongoose');

const inventorySchema=new mongoose.Schema({
    category:{
        type:String,
        enum:["base","sauce","cheese","vegetable"],
        required:true,
    },
    name:{
        type:String,
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
    threshold:{
        type:Number,
        required:true
    },
    flag:{
        type: Boolean,
        default:false
    }

})

module.exports=mongoose.model("Inventory",inventorySchema);