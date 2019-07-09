const express = require('express') ;
const router = new express.Router() ;

router.get('/', (req, res)=>{
	res.send({ message : "<h1>Welcome to the backend service of the web app)</h1>" }) ;
}) ;

module.exports = router ;