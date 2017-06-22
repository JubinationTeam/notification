'use strict'

//node dependencies
var request = require('request');

// global event emitter
var global;

// function to instantiate
function init(globalEmitter,globalCall){
    global=globalEmitter;
    globalEmitter.on(globalCall,setup)
}

//function to setup model's event listener
function setup(model)
{
    model.once("smsService",smsServiceFactory); 
}

//function to create a new 'smsService' function for each model
function smsServiceFactory(model){
    new smsService(model);
}

//function to send sms 
function smsService(model){
    
    var otp="7129"
    var fromNumber=model.req.body.mobile
    request({
            uri     : 'http://api.mVaayoo.com/mvaayooapi/MessageCompose',
            qs      : { 
                         user           : "akshay@jubination.com:jubination@1",
                         senderID       : "JUBINA",
                         receipientno   : "91"+fromNumber,
                         dcs            : "0",
                         msgtxt         : "Your OTP is "+otp,
                         state          : '4'
                    },
        
            method  : 'GET'

              }, 
            function(error,response){
                if(error){
                    console.log("Error in sending otp");
                }
                else{
                    console.log(response.body);
                }
    }); 

}

//exports
module.exports.init=init;