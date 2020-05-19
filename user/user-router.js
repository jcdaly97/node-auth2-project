const router = require("express").Router()

const Users = require('./user-model')
const restricted = require('./restricted')
router.use(restricted)

//user must have a token with a role and can only see users with that role 
router.get('/', (req,res)=>{
    const department = req.jwt.department
    if(department){
    Users.getUsersBy({department: department})
        .then(users=>{
            res.json(users)
        })
        .catch(err=>{
            res.json({
                message: 'error retrieving data',
                error: err
            })
        })
    }else{
       res.status(400).json({
           message: 'you need proper authorization to access this data'
       }) 
    }
})

module.exports = router