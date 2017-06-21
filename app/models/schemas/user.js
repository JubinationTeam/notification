//node dependencies
var mongoose=require('mongoose');
mongoose.Promise = require('bluebird');

// creating User schema
var user={
    id      : String,
    stage   : String,    
    email   : String,
    mobile  : String,
    count   : Number,
    sendDay : String,
    sendHour: String
};

var userSchema = mongoose.Schema(user);

// exports
module.exports=mongoose.model('userSchema', user);