const cron=require('node-cron');
const Inventory=require('../models/Inventory');
const mailSender=require('../utils/mailSender');


cron.schedule('* * * * *', async () => {
  console.log('running a task every minute');

  const inventories=await Inventory.find();

  if(inventories.length === 0){
    
        return "Inventory Not Found.";
  }

  for(let inventory of inventories){
    if(inventory.quantity<=inventory.threshold && inventory.flag === false){
        await mailSender(process.env.ADMIN_EMAIL,
          "LOW STOCK",
          `${inventory.name} stock is low. Only ${inventory.quantity} items are available.`
        );
        inventory.flag=true;
        await inventory.save();
    }

    if(inventory.quantity>inventory.threshold && inventory.flag === true){
        inventory.flag=false;
        await inventory.save();
    }
  }
  
});

