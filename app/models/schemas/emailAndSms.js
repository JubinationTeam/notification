//node dependencies
var mongoose=require('mongoose');
mongoose.Promise = require('bluebird');

// creating Email and SMS schema
var emailAndSms={
    emailBody   : String,
    emailSubject: String,
    emailType   : String,
    smsBody     : String,
    realTime    : Boolean,
    stage       : String,
    maxCount    : String,
    interval    : String,
    schemaType  : String
    };

var emailAndSmsSchema = mongoose.Schema(emailAndSms);

// exports
module.exports=mongoose.model('emailAndSmsSchema', emailAndSms);
