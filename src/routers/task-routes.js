const express = require('express')
const Task = require('../model/task')
const auth = require('../middleware/auth')

const router = new express.Router()

// Create new task 
router.post('/tasks' , auth , async (req , res) => {

    // const task = new Task(req.body)

    const task = new Task({
        ...req.body,
        owner:req.user._id
    })

    try {
        await task.save()
        res.send(task)
    } catch(e) {
        res.status(400).send()
    }
})



//GET      /tasks?completed=boolean
//paging   /tasks?limit=10&skip=20
//sorting  /task?sortBy=createdAt:desc
router.get('/tasks' , auth , async (req , res)=>{
    
    const match = {}
    const sort = {}

    if(req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? 1 : -1
    }


    try {        
        // const tasks = await Task.find({ owner:req.user._id }) , it also works fine
        await req.user.populate({
            path:'tasks',
            match, // if empty object , ignored by mongoose
            options:{
                limit:parseInt(req.query.limit), // if nothing is passed , then ignored by mongoose
                skip:parseInt(req.query.skip),
                sort                             //sorting received task , if empty then ignored
            },
        }).execPopulate()

        res.send(req.user.tasks)
    } catch(e) {
        res.status(500).send()
    }
})


//Fetch one task
router.get('/tasks/:id' , auth , async (req , res)=>{
    

    try {

        const task = await Task.findOne({ _id:req.params.id , owner: req.user._id}) // first one is the task id to be find , second one , is the user is to which the task is belong

        if(!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch(e) {
        res.status(500).send()
    }
})


//Update task
router.patch('/tasks/:id' , auth ,async (req , res) => {
    
    const updates = Object.keys(req.body)
    const updateTaskFileds = ['description' , 'completed']
    
    const valid = updates.every((elem)=> updateTaskFileds.includes(elem))

    if(!valid) {
        return res.status(400).send({"error": "invalid update"})
    }

    try {

        const task = await Task.findOne({ _id:req.params.id , owner:req.user._id })

        if(!task) {
            res.status(400).send()
        }

        updates.forEach((update) => {
            task[update] = req.body[update]
        })

        await task.save()

        res.send(task)
    } catch (e) {
        //handing the validation errro
        res.status(400).send(e)
    }
})


//Delete task
router.delete('/tasks/:id' , auth , async (req , res) => {
    try {
        
        const task = await Task.findOneAndDelete({ _id:req.params.id , owner:req.user._id })

        if(!task) {
            return res.status(400).send()
        }

        res.send(task)
    } catch(e) {
        res.status(500).send(e)
    }
})





module.exports = router