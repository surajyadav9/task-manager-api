const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../model/user')
const auth = require('../middleware/auth')
const { sendWelcomeEmail , sendGoodbyeEmail } = require('../emails/account')

const router = new express.Router()

// Create user to database
router.post('/users' , async (req , res) => {
    
    const user = new User(req.body)

    try{
        await user.save() 
        sendWelcomeEmail(user.email , user.name)
        const token = await user.generateAuthToken()

        // res.status(201).send({ user : user.getPublicProfile(), token })  // FOR WAY 1: TO HIDE DATA SEND TO USER

        res.status(201).send({ user, token }) // NOTE: res.send() calls 'JSON.stringify()' behind the scenes 
                                             //To convervt plain JS Object to JSON 
    }catch (e) {
        res.status(400).send(e)
    }

})



//Read Profile
router.get('/users/me', auth , async (req , res) => {
    res.send(req.user)
})




//User login
router.post('/users/login' , async (req , res) => {

    try {

        const user = await User.findByCredentials(req.body.email , req.body.password)

        const token = await user.generateAuthToken() //defined on instance to be authenticated

        res.send({ user, token })

    } catch (e) {
        res.status(400).send()
    }

}) 



//User logout
router.post('/users/logout' , auth , async (req , res) => {

    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token          //removing the token we created while loging / signup
        })
    
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})



//User logout from all sessions
router.post('/users/logoutAll' , auth , async (req , res) => {
    try {
        req.user.tokens = []  // removing all the tokens
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})


//Update user
router.patch('/users/me' , auth , async (req , res) => {

    const updates = Object.keys(req.body)
    const updateUserFields = ['name' , 'age'  ,'email' , 'password']

    const Validate = updates.every((elem) =>  updateUserFields.includes(elem)) //.every , method runs until a false is returned or array elem. ends.

    if(!Validate) {
        return res.status(400).send()
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update] )

        await req.user.save()

        // const user = await User.findByIdAndUpdate(req.params.id , req.body , { new:true , runValidators:true })   //=>this mongoose query fn. bypasses the hashing middleware fn. before save

        res.send(req.user)
    } catch (e) {
        //handling vallidation error
        res.status(400).send(e)
    }


})


//Delete user
router.delete('/users/me' , auth , async (req , res) => {
    try {    
        await req.user.remove()
        sendGoodbyeEmail(req.user.email , req.user.name)
        res.send(req.user)
    } catch(e) {
        res.status(500).send()
    }
})


//Upload file
// create multer instance
const upload = multer({  
    limits:{
        fileSize:1000000 // max 1MB , 1 million
    },
    fileFilter(req , file , cb) {
        //cb(new Error('Error'))
        //cb(undefined , true) // no error & expecting a file
        //cb(undefined , false) //silently rejectin the file

        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error({ error:'Expecting a .jpg, .jpeg or .png file' }))
        }

        cb(undefined , true)
    }
})
router.post('/users/me/avatar' , auth , upload.single('avatar') , async (req , res) => {
    
    const buffer = await  sharp(req.file.buffer).resize({ width:250 , height:250 }).png().toBuffer()  // some changes to avatar pic
    
    req.user.avatar = buffer

    await req.user.save()
    res.send()

},(error , req , res , next) => {  // handle errors
    res.status(400).send({error:error.message})
})



//Delete avatar file
router.delete('/users/me/avatar' , auth , async (req , res) =>{

    try {
        if(!req.user.avatar) throw new Error('No avatar exists.')
        req.user.avatar = undefined
        req.user.save()
        res.send()
    } catch (e) {
        res.status(400).send({error:e.message})
    }

})


//Get avatar
router.get('/users/:id/avatar' ,  async (req , res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.avatar) {
            throw new Error()
        }

        res.set('Content-Type' , 'image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(400).send()
    }
})


module.exports = router
