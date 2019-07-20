const mongoose = require('mongoose') ;

mongoose.set('useCreateIndex', true) ;

mongoose.connect(process.env.MONGODB_URL,{
	// sslCA: certFileBuf, Uncomment before submission
	useNewUrlParser: true,
	useCreateIndex: true,
	useFindAndModify: false
}).then((db)=>{
	console.log("Successfully connected to database :)") ;
}).catch(error => {
	console.log(error) ;
	console.log("Not able to connect to database. Possible reason: free trial has expired :( ") ;
});