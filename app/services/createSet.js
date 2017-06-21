'use strict'

//node dependencies
var request = require('request');

//user-defined dependencies
var emailAndSmsSchema=require('./../models/schemas/emailAndSms.js')

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

//function to create a data set in the emailANdSms schema of local database 
function createSet(model){
    model.dbOpsType="create"
    model.schema=emailAndSmsSchema
    model.data=model.req.body
    model.callBackFromDataAccess="createdSet"
    model.on("createdSet",(model)=>{
                                        model.emit(globalCallBackRouter,model)
                                    })
    global.emit(globalDataAccessCall,model)
    model.emit(model.dbOpsType,model)
    
}

//exports
module.exports.init=init;