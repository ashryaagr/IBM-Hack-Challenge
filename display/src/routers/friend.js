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
                    throw err
                else{
                    user.friends.push(friend); //check (trying to add friend to user's list of friends)
                    user.save();
                }
            })
            }).catch((e) => {
                res.status(400).send(err);
            })
    }
)

router.patch('/friend' , passport.authenticate('jwt', { session:false }) ,
    async (req , res) => {
        const usernames = req.body.usernames;
        try{
            Friend.findOne({name : req.body.name , owner : req.user._id} , function(err , friend){
                if (err)
                    throw err;
                else
                {
                    usernames.forEach((username) => {
                        friend.usernames.set(username.site , username.credentials);
                        friend.save();
                    });        
                }
            })
        }  catch (e) {
			res.status(500).send(e)
		}
    }
)

router.delete('/friend' , passport.authenticate('jwt', { session:false }) ,
    async (req , res) => {
        try{
            Friend.findOne({name : req.body.name , owner : req.user._id} , function(err , friend){
                if (err)
                    throw err;
                else
                {
                    friend.remove();
                    req.user.friends.pull(friend); //check (trying to remove friend from user's list of friends) 
                }
            })
        }  catch (e) {
			res.status(500).send(e)
		}
    }
)