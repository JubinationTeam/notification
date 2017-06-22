'use strict'

//node dependencies
var request = require('request');

//user-defined dependencies
var emailAndSmsSchema=require('./../models/schemas/emailAndSms.js')
var sg = require('sendgrid')(process.env.SENDGRID_API_KEY);

// global event emitter
var global;

//global variables
const headers     = {
                        'User-Agent':'Super Agent/0.0.1',
                        'Content-Type':'application/json'
                }

// function to instantiate
function init(globalEmitter,globalCall){
    global=globalEmitter;
    globalEmitter.on(globalCall,setup)
}

//function to setup model's event listener
function setup(model)
{
    model.once("emailService",emailServiceFactory); 
}

//function to create a new 'emailService' function for each model
function emailServiceFactory(model){
    new emailService(model);
}

//function to send email 
function emailService(model){
    var request = sg.emptyRequest({
      method    : 'POST',
      path      : '/v3/mail/send',
      body      : {
                    personalizations: [{
                                        to      :[{
                                                    email: model.req.body.email
                                                 }],

                                        subject :   model.sendDetails.emailSubject

                                      }],

                                        from: {
                                                email: 'subhadeep@jubination.com'
                                            },

                    content         : [{
                                        type    : 'text/plain',

                                        value   : model.sendDetails.emailBody
                                      }]
                    }
    });
 
    // With promise 
    sg.API(request)
      .then(function (response) {
        console.log(response.statusCode);
        console.log(response.body);
        console.log(response.headers);
      })
      .catch(function (error) {
        // error is an instance of SendGridError 
        // The full response is attached to error.response 
        console.log(error.response.statusCode);
      });

    // With callback 
    sg.API(request, function (error, response) {
      if (error) {
        console.log('Error response received');
      }
      console.log(response.statusCode);
      console.log(response.body);
      console.log(response.headers);
    });    
    
}

//exports
module.exports.init=init;