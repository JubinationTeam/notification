'use strict'

//node dependencies
var events  = require('events')

class eventClass extends events{}

//user-defined dependencies
var user=require('./../models/schemas/user.js')
var emailAndSmsSchema=require('./../models/schemas/emailAndSms.js')

// global event emitter
var global;

// event names
var globalDataAccessCall;
var globalCallBackRouter

// function to instantiate
function init(globalEmitter,globalDACall,callback){
    global=globalEmitter;
    globalDataAccessCall=globalDACall
    globalCallBackRouter=callback
    
    setInterval(function(){
        
        var sendData= setSendParameters(0,0)
        
        var model=new eventClass()
        model.dbOpsType="read"
        model.schema=user
        model.offset=0
        model.readLimit=10000000000000
        model.data={
                    "sendDay"   : sendData[0],
                    "sendHour"  : sendData[1]
        }
        model.callBackFromDataAccess="userSchemaRead"
        model.on(model.callBackFromDataAccess,(model)=>{
                                                            postDataAccessCallback(model)
                                                        })
        global.emit(globalDataAccessCall,model)
        model.emit(model.dbOpsType,model)
    },3600000)
    
}

function postDataAccessCallback(modelPreLoop){
    
    for(var i=0;i<modelPreLoop.status.length;i++)
    {
        var model= new eventClass();
        model.on("readDocument",readEmailAndSmsSchema);
        model.data=modelPreLoop.status[i]
        model.emit("readDocument",model);
    }
}

function readEmailAndSmsSchema(model){
    
    model.backUp=model.data
    model.dbOpsType="read"
    model.offset=0
    model.readLimit=1
    model.schema=emailAndSmsSchema
    model.data={
                    "stage":model.backUp.stage
    }
    model.callBackFromDataAccess="readEmailAndSms"+model.backUp.id
    model.on(model.callBackFromDataAccess,(model)=>{
                                                        model.sendDetails=model.status[0]
                                                        model.data=model.backUp
                                                        sendEmailSms(model)
                                                   })
    global.emit(globalDataAccessCall,model)
    model.emit(model.dbOpsType,model)
}

function sendEmailSms(model){
    
    if(model.data.count<=model.sendDetails.maxCount){
        if(model.status[0].schemaType=="both"){
            global.emit("email",model)
            model.emit("emailService",model)
            global.emit("sms",model)
            model.emit("smsService",model)
        }
        else if(model.status[0].schemaType=="email"){
            global.emit("email",model)
            model.emit("emailService",model)
        }
        else if(model.status[0].schemaType=="sms"){
            global.emit("sms",model)
            model.emit("smsService",model)
        }
        updateUserDetails(model)    
    }
    else{
        console.log("Max count exceeded")
    }
}

function updateUserDetails(model){

    var updatedSendData = setSendParameters(model.sendDetails.days,model.sendDetails.hours)
    
    model.dbOpsType="update"
    model.schema=user
    model.id=model.data._id
    model.data.count=model.data.count + 1
    
    model.data={
                "sendDay"   : updatedSendData[0],
                "sendHour"  : updatedSendData[1],
                "count"     : model.data.count
    }
    model.callBackFromDataAccess="updated"+model.data.id
    model.on(model.callBackFromDataAccess,()=>{console.log("Successfully Updated")})
    global.emit(globalDataAccessCall,model)
    model.emit(model.dbOpsType,model)
    
}

function setSendParameters(day,hour){
    
    var currentTime = new Date();
    var currentOffset = currentTime.getTimezoneOffset();
    // IST offset UTC +5:30 
    var ISTOffset = 330;   
    var ISTTime = new Date(currentTime.getTime() + (ISTOffset + currentOffset)*60000);
    // ISTTime now represents the time in IST coordinates
    var sendDay = new Date(Date.parse(currentTime) + day * 86400000).toISOString().slice(0,10).toString();
    var sendHour = ISTTime.getHours()+hour
    
    return[sendDay,sendHour]
    
}

//exports
module.exports.init=init;