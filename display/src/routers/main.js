const express = require('express') ;
const router = new express.Router() ;

router.get('/', (req, res)=>{
	res.render('register') ;
}) ;

router.get('/login', (req, res)=>{
	res.render('login') ;
}) ;

router.get('/register', (req, res)=>{
	res.render('register') ;
}) ;

router.get('/add_friend', (req, res)=>{
	res.render('add_friend') ;
}) ;

module.exports = router ;