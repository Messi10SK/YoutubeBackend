
import dotenv from "dotenv"
import connectDB from './db/index.js';
import {app} from './app.js';

// Set the number according to your application needs
dotenv.config({
    path:'./.env'
})


connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server running on port ${process.env.PORT || 8000}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to the database:", error);
  });
















  

// import mongoose from'mongoose';
// import { DB_NAME } from './constants.js';

// import express from 'express';
// const app = express();
// ;(async ()=>{
//     try{
//         await  mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on("errror",(error)=>{
//             console.error("connection error",error)
//             throw err;
//         })

//         app.listen(process.env.PORT,()=>{
//             console.log(`App is listening on port ${process.env.PORT}`)
//         })
//     }
//     catch(error){
//         console.error("error",error)
//         throw err;
//     }
// })()