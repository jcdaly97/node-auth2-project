const bcrypt = require('bcryptjs')
const router = require('express').Router()
const jwt = require('jsonwebtoken')
const Users = require('./user-model')
const {isValid} = require('./validation')

function createToken(user){
    const payload = {
        sub: user.id,
        username: user.username,
        department: user.department
    }
    const secret = 'dont tell nobody'

    const options = {
        expiresIn: "1h"
    }

    return jwt.sign(payload, secret, options)
}

router.post('/register', (req,res) =>{
    const userCreds = req.body
    
    if(isValid(userCreds)){
        //set number of rounds the hashing will happen
        const rounds = 2
        //creat the hash
        const hash = bcrypt.hashSync(userCreds.password, rounds)
        //set the password to that hash
        userCreds.password = hash
        //save the user
        Users.addUser(userCreds)
            .then(user=>{
                //add a logged in bool to the session
                req.session.loggedIn = true
                res.status(201).json(user)
            })
            .catch(err=>{
                res.status(500).json({
                    message: 'unable to save user',
                    error: err
                })
            })
    }else{
        res.status(401).json({ message: "Invalid username and or password" })
    }
})

router.post('/login', (req,res)=>{
    const userCreds = req.body
    if(isValid(userCreds)){
        Users.getUsersBy({username: userCreds.username})
            .then(([user])=>{
                if(user && bcrypt.compareSync(userCreds.password, user.password)){
                    const token = createToken(user)
                    res.status(200).json({
                        message: 'logged in!',
                        token: token
                    })
                }else{
                    res.status(401).json({ message: "Invalid credentials" })
                }
            })
            .catch(err=>{
                res.status(500).json({
                    message: 'trouble logging in'
                })
            })
    }else{
        res.status(401).json({ message: "Invalid username and or password" })
    }
})

router.get("/logout", (req, res) => {
    //checks if there's a token
    const token = req.jwt
    if (token) {
        //if it finds one, destroys it
        jwt.destroy(token)
    } else {
      res.status(204).end()
    }
  })

module.exports = router