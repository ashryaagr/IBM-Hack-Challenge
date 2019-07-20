const mongoose = require('mongoose') ;
const fs = require('fs');
const path = require('path') ;

const certFileBuf = fs.readFileSync(path.join(__dirname, 'ssl'));

mongoose.set('useCreateIndex', true) ;

// Connection String to put in dev.env before submission :
//mongodb://admin:xcKpnTZVbbfd76mn@SG-ibmashryaagr-23327.servers.mongodirector.com:49150/admin?replicaSet=RS-ibmashryaagr-0&ssl=true

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