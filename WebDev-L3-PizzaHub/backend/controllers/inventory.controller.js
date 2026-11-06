const Inventory=require('../models/Inventory');

exports.createInventory=async(req,res)=>{
    try {
        const {name,category,quantity,threshold}=req.body;

        if (
  typeof name !== "string" ||
  !name.trim() ||
  !["base", "sauce", "cheese", "vegetable"].includes(category) ||
  quantity === undefined ||
  threshold === undefined ||
  !Number.isFinite(Number(quantity)) ||
  !Number.isFinite(Number(threshold))
) {
  return res.status(400).json({
    success: false,
    message: "Valid name, category, quantity and threshold are required.",
  });
}

          if (quantity < 0 || threshold < 0) {
            return res.status(400).json({
                success: false,
                message: "Quantity and threshold cannot be negative."
            });
        }

        const inventory = await Inventory.create({
            category,
            name,
            quantity,
            threshold
        });

        return res.status(201).json({
            success: true,
            inventory,
            message: "Inventory created successfully."
        });


    } catch (error) {
         console.error("Create Inventory Error:", error);

        return res.status(500).json({
            success: false,
            message: "Error while creating inventory."
        });
    }
}


//Get All Inventory

exports.getAllInventory = async(req,res)=>{
      try {
        const inventory = await Inventory.find();

        return res.status(200).json({
            success: true,
            inventory,
            message: "Inventory fetched successfully."
        });

    } catch (error) {
        console.error("Get Inventory Error:", error);

        return res.status(500).json({
            success: false,
            message: "Error while fetching inventory."
        });
    }
}

//Update Inventory
exports.updateInventory = async (req, res) => {
    try {
        const inventoryId = req.params.inventoryId;

        const {
            category,
            name,
            quantity,
            threshold
        } = req.body;

        if (!inventoryId) {
            return res.status(400).json({
                success: false,
                message: "Inventory ID is required."
            });
        }

        if (quantity !== undefined && quantity < 0) {
            return res.status(400).json({
                success: false,
                message: "Quantity cannot be negative."
            });
        }

        if (threshold !== undefined && threshold < 0) {
            return res.status(400).json({
                success: false,
                message: "Threshold cannot be negative."
            });
        }

        const updateData = {};

        if (category !== undefined) updateData.category = category;
        if (name !== undefined) updateData.name = name;
        if (quantity !== undefined) updateData.quantity = quantity;
        if (threshold !== undefined) updateData.threshold = threshold;

        const inventory = await Inventory.findByIdAndUpdate(
            inventoryId,
            updateData,
            { new: true }
        );

        if (!inventory) {
            return res.status(404).json({
                success: false,
                message: "Inventory not found."
            });
        }

        return res.status(200).json({
            success: true,
            inventory,
            message: "Inventory updated successfully."
        });

    } catch (error) {
        console.error("Update Inventory Error:", error);

        return res.status(500).json({
            success: false,
            message: "Error while updating inventory."
        });
    }
};


//Delete Inventory
exports.deleteInventory = async (req, res) => {
    try {
        const inventoryId = req.params.inventoryId;

        if (!inventoryId) {
            return res.status(400).json({
                success: false,
                message: "Inventory ID is required."
            });
        }

        const inventory = await Inventory.findByIdAndDelete(
            inventoryId
        );

        if (!inventory) {
            return res.status(404).json({
                success: false,
                message: "Inventory not found."
            });
        }

        return res.status(200).json({
            success: true,
            inventory,
            message: "Inventory deleted successfully."
        });

    } catch (error) {
        console.error("Delete Inventory Error:", error);

        return res.status(500).json({
            success: false,
            message: "Error while deleting inventory."
        });
    }
};