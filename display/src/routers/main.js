const express = require('express') ;
const router = new express.Router() ;

router.get('/', (req, res)=>{
	res.send({ message : "<h1>Welcome to the backend service of the web app)</h1>" }) ;
}) ;

// TODO: routes for API calls and calls to the flask server come here
// flask endpoint to call for stack : https://localhost:8000/stack , twitter(and all except stack): https://localhost:8000/

module.exports = router ;