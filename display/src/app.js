var bodyParser = require('body-parser') ;
// require('./db/mongoose') ;
const express = require('express') ;


const main_router = require('./routers/main') ;

const app = express() ;


// Next 5 lines help in parsing input and getting req.body
app.use(bodyParser.urlencoded({ extended: false })) ;
// parse application/json
app.use(bodyParser.json()) ;
// parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })) ;

app.use(main_router) ;

module.exports = app;