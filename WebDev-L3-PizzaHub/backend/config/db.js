const mongoose=require('mongoose');

async function main(){
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Database Connected Successfully");
    } catch (err) {
        console.log("Error in DB connection",err.message);
        process.exit(-1);
    }
}

module.exports=main;