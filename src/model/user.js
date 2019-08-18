const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('../model/task')

const userSchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        unique:true,
        trim:true,
        lowercase:true,
        validate(value) {
            if(!validator.isEmail(value)) {
                throw new Error('Email is unvalid')
            }
        }
    },
    age:{
        type:Number,
        default:0,
        validate(value) {
            if(value<0) {
                throw new Error('age is invalid')
            }
        }
    },
    password:{
        type:String,
        required:true,
        trim:true,
        minlength:6,
        validate(value) {
            if(value === 'password' || value === 'PASSWORD') {
                throw new Error('invalid password')
            }
        }
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }],
    avatar:{
        type:Buffer
    }
},{
    timestamps:true
})
//Tokens becomes an empty array when nothing is passed



//Creating virtual schema ,for all the task a user owns
userSchema.virtual('tasks' , {
    ref:'Task',
    localField:'_id',
    foreignField:'owner'
})



// Hiding the credentials before it send to the user : 2 WAYS

// WAY:1
// userSchema.methods.getPublicProfile = function(){
//     const user = this
//     const userObject = user.toObject()  // converts this document into plain javaScript Object

//     return userObject;
// }

// RECOMENDED WAY
userSchema.methods.toJSON = function () {  // trigers when the res.send() is called 
    const user = this
    var userObject = user.toObject() // Converts this document to plain JS Object   

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}


//JWT
//schema.method.methodName => Define custom method on document-instance & individual user
userSchema.methods.generateAuthToken = async function() {

    user = this
    const token = await jwt.sign({ _id:user._id.toString() } , process.env.JWT_SECRET_KEY)

    user.tokens = user.tokens.concat({ token })  // concat added item at the end of the array

    await user.save()  // Saving the user with the same ID

    return token

}



//Loging user 
//schema.statics.methodName => Define custom method on 'User' model 
userSchema.statics.findByCredentials = async (email , password) => {
    
    const user = await User.findOne({ email })

    if(!user) {
        throw new Error('Unable to login')
    }

    const Match = await bcrypt.compare(password , user.password)

    if( !Match) {
        throw new Error('Unable to login')
    }

    return user
}


// Middleware, hash the password before save 
userSchema.pre('save' , async function(next){
    const user = this   // here this refers to the document which is about to save

    if(user.isModified('password')) {
        user.password = await bcrypt.hash(user.password , 8)
    }

    next()  // execution of the code block is done
})



//Middleware hook ,to Delete tasks when user is removed
userSchema.pre('remove' , async function(next) {
    const user = this 
    
    await Task.deleteMany({owner : user._id})

    next()
})



const User = mongoose.model('User' , userSchema)


module.exports = User