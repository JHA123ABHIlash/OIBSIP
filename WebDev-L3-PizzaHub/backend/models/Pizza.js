const mongoose=require('mongoose');

const pizzaSchema=new mongoose.Schema({
    name:{
        type:String,
        trim:true,
        required:true
    },
    base:{
         type:String,
        trim:true,
        required:true
    },
    sauce:{
         type:String,
        trim:true,
        required:true
    },
    cheese:{
         type:String,
        trim:true,
        required:true
    },
    vegetable: {
        type: [String],
        required: true
    },
    price:{
         type:Number,
        required:true
    },
    image:{
         type:String
    },
    category: {
  type: String,
  enum: ["Veg", "Non-Veg", "Cheese Burst", "Classic"],
  required: true
}
})

module.exports=mongoose.model("Pizza",pizzaSchema);