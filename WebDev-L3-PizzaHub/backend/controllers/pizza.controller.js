const Pizza=require('../models/Pizza');

exports.createPizza=async(req,res)=>{
   try {
    //Get Value & Validate
     const { name,base,sauce,cheese,vegetable,price,image,category } =req.body;

    if(!name|| !base|| !sauce || !cheese || !vegetable || !price || !image || !category){
        return res.status(400).json({
            success:false,
            message:"All fields are required."
        })
    }

    //price validation
    if(price<=0){
        return res.status(400).json({
            success:false,
            message:"Please Enter Valid Price."
        })
    }

    //Create Pizza.

    const pizza=await Pizza.create({
        name,base,sauce,cheese,vegetable,price,image,category
    });

    //Send Response.

    return res.status(201).json({
        success:true,
        pizza,
        message:"Pizza Created Successfully"
    });
   } catch (error) {
    console.error(error)
        return res.status(500).json({
            success:false,
            error:error.message,
            message:"Error whiles in Create Pizza."
   })
   }
}


// Get All Pizza

exports.getAllPizzas=async(req,res)=>{

   try {
     //get and vailidate
    const pizza=await Pizza.find();

    if(pizza.length === 0){
        return res.status(404).json({
            success:false,
            message:"Pizza not exist"
        });
    }

    return res.status(200).json({
        success:true,
        pizza,
        message:"Pizza fetched successfully."
    })
   } catch (error) {
    console.log(error.message);
    return res.status(500).json({
            success:false,
            error:error.message,
            message:"Error whiles in Geting Pizza."
   })
   }
}


//Get Pizza By Id.

exports.getPizzaById=async(req,res)=>{
    try {
        //get pizzaId and validate
        const pizzaId=req.params.pizzaId;

    if(!pizzaId){
        return res.status(404).json({
            success:false,
            message:"ID not found"
        })
    };

    //find pizza and validate.
    const pizza=await Pizza.findById(pizzaId);

     if(!pizza){
        return res.status(404).json({
            success:false,
            message:"Pizza not found"
        })
    };

    //send response.
    return res.status(200).json({
            success:true,
            pizza,
            message:"Pizza get successfully."
    })
    } catch (error) {
         console.log(error.message);
        return res.status(500).json({
            success:false,
            error:error.message,
            message:"Error whiles in Geting Pizza By Id."
        })
    }

}


//Update Pizza
exports.updatePizza=async(req,res)=>{
   try {
        // get pizzaId and data from body and params.
        const pizzaId=req.params.pizzaId;
        const { name,base,sauce,cheese,vegetable,price,image,category } =req.body;

        if (!pizzaId){
            return res.status(400).json({
                success:false,
                message:"PizzaId not found"
            })
        }

        const updateData = {};

        if (name !== undefined) updateData.name = name;
        if (base !== undefined) updateData.base = base;
        if (sauce !== undefined) updateData.sauce = sauce;
        if (cheese !== undefined) updateData.cheese = cheese;
        if (vegetable !== undefined) updateData.vegetable = vegetable;
        if(category !== undefined) updateData.category=category;
        if (price !== undefined && price <= 0) {
    return res.status(400).json({
        success: false,
        message: "Please Enter Valid Price."
    });
}

if (price !== undefined) updateData.price = price;
        if (image !== undefined) updateData.image = image;

       const pizza = await Pizza.findByIdAndUpdate(
            pizzaId,
            updateData,
            { new: true }
        )

        if (!pizza){
            return res.status(404).json({
                success:false,
                message:"Pizza not found"
            })
        }

        return res.status(200).json({
            success:true,
            pizza,
            message:"Pizza Updated Successfully."
        })
   } catch (error) {
     console.log(error.message);
        return res.status(500).json({
            success:false,
            error:error.message,
            message:"Error whiles in Updating Pizza."
        })
   }
}


//Delete Pizza.
exports.deletePizza = async (req, res) => {
    try {
        const pizzaId = req.params.pizzaId;

        // Validate pizzaId
        if (!pizzaId) {
            return res.status(400).json({
                success: false,
                message: "PizzaId not found"
            });
        }

        // Find and delete pizza
        const pizza = await Pizza.findByIdAndDelete(pizzaId);

        // Pizza not found
        if (!pizza) {
            return res.status(404).json({
                success: false,
                message: "Pizza not found"
            });
        }

        // Send response
        return res.status(200).json({
            success: true,
            pizza,
            message: "Pizza deleted successfully."
        });

    } catch (error) {
        console.log(error.message);

        return res.status(500).json({
            success: false,
            error: error.message,
            message: "Error while deleting pizza."
        });
    }
};