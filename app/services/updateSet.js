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
    model.once("service",updateSetFactory); 
}

//function to create a new 'updateSet' function for each model
function updateSetFactory(model){
    new updateSet(model);
}

//function to update a data set in the emailANdSms schema of local database 
function updateSet(model){
    console.log("Im in update set 1")
    model.dbOpsType="read"
    model.schema=emailAndSmsSchema
    model.offset=0
    model.readLimit=1
    model.data={
        "stage":model.req.body.stageName
    }
    model.callBackFromDataAccess="readSet"
    model.on(model.callBackFromDataAccess,(model)=>{
                                                        console.log("Im in update set 2")
                                                        model.dbOpsType="update"
                                                        model.schema=emailAndSmsSchema
                                                        model.id=model.status[0]._id
                                                        model.data=model.req.body.newData
                                                        model.callBackFromDataAccess="updatedSet"
                                                        model.on(model.callBackFromDataAccess,(model)=>{
                                                            console.log(model.status)
                                                            model.info="Updated Successfully"
                                                            model.emit(globalCallBackRouter,model)
                                                        global.emit(globalDataAccessCall,model)
                                                        model.emit(model.dbOpsType,model)
                                                        })
                                    })
    global.emit(globalDataAccessCall,model)
    model.emit(model.dbOpsType,model)
    
}

//exports
module.exports.init=init;