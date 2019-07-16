const express = require('express') ;
const router = new express.Router() ;

router.get('/', (req, res)=>{
	res.render('index', {
		title : "Test Page",
		message : "Welcome to the backend service of the web app"
	}) ;
}) ;


module.exports = router ;