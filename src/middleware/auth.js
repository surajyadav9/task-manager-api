const jwt = require('jsonwebtoken')
const User = require('../model/user')

//Autorize user to access specific urls
const auth = async (req , res ,next) => {

    try {
        var token = req.header('Authorization')
        token = token.replace('Bearer ' , '')

        const decodedPayload = await jwt.verify(token , process.env.JWT_SECRET_KEY) //Here , decodedPayload = {_id:'userID' , iat:'some time stamp'}

        const user = await User.findOne({ _id:decodedPayload._id , 'tokens.token':token})  //second arg is checking , wether the token is still in token array of the user who is logger in
        //because , we delete the tokens when user is locked out

        if(!user) {
            throw new Error()
        }


        req.token = token
        req.user = user //assigning new property to req

        next()
    } catch (e) {
        res.status(401).send({ error:'Please authenticate.' })
    }
}


module.exports = auth