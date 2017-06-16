'use strict'

//node dependencies
var request = require('request');

//user-defined dependencies
var emailAndSmsSchema=require('./../models/schemas/emailAndSms')

// global event emitter
var global;

//Guard Access Variables
var commonAccessUrl;
var guardKey;

// event names
var globalDataAccessCall;
var globalCallBackRouter

//global variables
const headers     = {
                        'User-Agent':'Super Agent/0.0.1',
                        'Content-Type':'application/json'
                }

// function to instantiate
function init(globalEmitter,globalCall,globalDACall,callback){
    global=globalEmitter;
    globalEmitter.on(globalCall,setup)
    globalDataAccessCall=globalDACall
    globalCallBackRouter=callback
}

//function to setup model's event listener
function setup(model)
{
    model.once("service",createSetFactory);
}

//function to create a new 'createSet' function for each model
function createSetFactory(model){
    new createSet(model);
}

//function to create a data set in the emailANdSms schema of the local database 
function createSet(model){
    model.dbOpsType="create"
    model.schema=emailAndSmsSchema
//    model.req.body
  model.data=  {
        emailBody   : model.req.body.emailBody,
        emailSubject: model.req.body.emailSubject,
        emailType   : model.req.body.emailType,
        smsBody     : model.req.body.smsBody,
        realTime    : model.req.body.realTime,
        stage       : model.req.body.stage,
        maxCount    : model.req.body.maxCount,
        interval    : model.req.body.interval,
        schemaType  : model.req.body.scheamType
    }
    model.callBackFromDataAccess="createdSet"
    model.on("createdSet",()=>{model.info="SUUCESSFULLY CREATED"+JSON.stringify(model.req.body);model.emit(globalCallBackRouter,model)})
    global.emit(globalDataAccessCall,model)
    model.emit(model.dbOpsType,model)
    
}

//exports
module.exports.init=init;