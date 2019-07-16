const mongoose = require('mongoose')

const taskSchema = mongoose.Schema({
    description:{
        type:String,
        required:true,
        trim:true
    },
    completed:{
        type:Boolean,
        default:false
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'  // helps to use 'userInstance.owner.populate('owner').execPopulate()'
    }    
},{
    timestamps:true
})

const Task = mongoose.model('Task', taskSchema)

module.exports = Task