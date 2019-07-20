const Friend = require('../models/friend') ;
const express = require('express');
const passport = require('../passport') ;
const fs = require('fs') ;
const path = require('path') ;

const router = new express.Router() ;

router.post('/friend' , passport.authenticate('jwt', { session:false }) , 
    async (req , res) => {
        const friend = Friend(req.body) ;
        friend.usernames = {
        	stack : req.body.stack,
			twitter : req.body.twitter,
			reddit : req.body.reddit,
			youtube : req.body.youtube
		} ;
        friend.owner = req.user._id ;
		await friend.save().then((friend)=>{
			res.status(200).send(friend._id)
		}).catch((e)=>{
			res.status(400).send(e) ;
		}) ;
    }
) ;

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

router.delete('/friend/:id/' , passport.authenticate('jwt', { session:false }) ,
    async (req , res) => {
    try{
        const friend = await Friend.findOneAndDelete({ _id: req.params.id, owner: req.user._id }) ;
        if (!friend) {
            res.status(404).send()
        }
        fs.unlink(path.join(__dirname, `../../cache/${friend._id}-personality.json`), (err=>{})) ;
		fs.unlink(path.join(__dirname,`../../cache/${friend._id}-nlu.json`), (err => {})) ;
		fs.unlink(path.join(__dirname,`../../cache/${friend._id}-tone.json`), (err => {})) ;

        res.status(200).send()
    } catch (e) {
        res.status(500).send()
        }
    }
);

module.exports = router ;