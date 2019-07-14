const express = require('express') ;
const passport = require('../passport') ;
const Friend = require('../models/friend') ;

const router = new express.Router() ;

router.get('/cluster', passport.authenticate('jwt', { session:false }), (req, res)=>{
	// TODO: perform clustering analysis on the friends using the machine learning model .
}) ;

module.exports = router ;