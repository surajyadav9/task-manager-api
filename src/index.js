require('dotenv').config()
const express = require('express')
require('./db/mongoose');
const userRouter = require('./routers/user-routes')
const taskRouter = require('./routers/task-routes')

const app = express()
const port = process.env.PORT


//Middleware for maintainance

// app.use((req , res , next)=>{
//     res.status(503).send({"Excuse us":"Our site is under maintainance , Please give a try soon!"})
// })


app.use(express.json())    // To Parse incoming json data to object
app.use(userRouter)       //Register user router with express app
app.use(taskRouter)      //Register task router with express app



app.listen(port , () => {
    console.log('Server is connected on port ' + port)
})


// Playground :=>


//1. .toJSON : behind the Scenes

// const pet = {
//     name : 'Hal'
// }

// pet.toJSON = function(){ // is called ,Whenever the object is 'stingified'
//     //return {}
//     return this
// }

// console.log(JSON.stringify(pet)) //{} , when empty object is returned from 'toJSON', Otherwise the normal behaviour
