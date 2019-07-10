// TODO : Add CRUD operations for the friend  model
const Friend = require('../models/friend') ;
const User = require('../models/user') ;
const express = require('express');
const passport = require('../passport') ;

const router = new express.Router()

router.post('/friend' , passport.authenticate('jwt', { session:false }) , 
    async (req , res) => {
        const friend = new Friend(req.body);
        friend.save().then((friend)=>{
            User.findById(friend.owner , function(err , user){
                if (err)
                    res.status(400).send(err);
                else{
                    user.friends.push(friend);
                    user.save();
                }
            })
            }).catch((e) => {
                res.status(400).send(err);
            })
    }
)

router.post('/friend' , passport.authenticate('jwt', { session:false }) ,
    async (req , res) => {
        try{
            Friend.findOne({name : req.body.name , owner : req.user._id} , function(err , friend){
                if (err)
                    throw err;
                else
                    friend.remove();
            })
        }  catch (e) {
			res.status(500).send(e)
		}
    }
)