'use strict'

//user-defined dependencies
var user=require('./../models/schemas/user.js')
var emailAndSmsSchema=require('./../models/schemas/emailAndSms.js')

// global event emitter
var global;

// event names
var globalDataAccessCall;
var globalCallBackRouter

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
    model.once("service",managerFactory); 
}

//function to create a new 'manager' function for each model
function managerFactory(model){
    new manager(model);
}

function manager(model){
    model.data=model.req.body
    
    if(model.data.userType=="lead"){
        createLeadCopy(model)    
    }
    else if(model.data.userType=="primary"){
        stageDependentDecision(model)
    }
    else{
        model.info="Invalid User type"
        model.emit(globalCallBackRouter,model)
    }
}

function createLeadCopy(model){
 
        model.dbOpsType="create"
        model.schema=user
        model.data={
                    "id"      : model.data.id,
                    "email"   : model.data.email,
                    "mobile"  : model.data.mobile,
                    "count"   : 0,
                    "stage"   : model.data.stage
    }
        model.callBackFromDataAccess="createdLocalCopy"+model.data.id
        model.on(model.callBackFromDataAccess,stageDependentDecision)
        global.emit(globalDataAccessCall,model)
        model.emit(model.dbOpsType,model)
    
}

function stageDependentDecision(model){
    model.dbOpsType="read"
    model.schema=emailAndSmsSchema
    model.data={
            "stage":model.data.stage  
    }
    model.offset=0
    model.readLimit=1
    model.callBackFromDataAccess="readEmailAndSmsLocalCopy"+model.data.id
    model.on(model.callBackFromDataAccess,(model)=>{
        model.sendDetails=model.status[0]
        if(model.sendDetails.realTime==true){
            model.count=1
            sendImmediateEmailOrSms(model)
        }
        else{
            model.count=0
            updateUserDetails(model)
        }
    })
    global.emit(globalDataAccessCall,model)
    model.emit(model.dbOpsType,model)
}

function sendImmediateEmailOrSms(model){
    if(model.sendDetails.schemaType=="both"){
        global.emit("email",model)
        model.emit("emailService",model)
        global.emit("sms",model)
        model.emit("smsService",model)
    }
    else if(model.sendDetails.schemaType=="email"){
        global.emit("email",model)
        model.emit("emailService",model)
    }
    else if(model.sendDetails.schemaType=="sms"){
        global.emit("sms",model)
        model.emit("smsService",model)
    }
    updateUserDetails(model)
}

function updateUserDetails(model){
    model.dbOpsType="read"
    model.schema=user
    model.data={
                    "id":model.data.id 
    }
    
    model.callBackFromDataAccess="updateUserDetails"+model.data.id
    model.on(model.callBackFromDataAccess,(model)=>{
        model.dbOpsType="update"
        model.schema=user
        model.id=model.status[0]._id

        var currentTime = new Date();
        var currentOffset = currentTime.getTimezoneOffset();
        // IST offset UTC +5:30 
        var ISTOffset = 330;   
        var ISTTime = new Date(currentTime.getTime() + (ISTOffset + currentOffset)*60000);
        // ISTTime now represents the time in IST coordinates
        var sendDay = new Date(Date.parse(currentTime) + model.sendDetails.days * 86400000).toISOString().slice(0,10).toString();
        var sendHour = ISTTime.getHours()+model.sendDetails.hours
        
        model.data={
                    "stage"     : model.data.stage,
                    "sendDay"   : sendDay,
                    "sendHour"  : sendHour,
                    "count"     : model.count
        }
        
        model.callBackFromDataAccess="updated"+model.data.id
        model.on(model.callBackFromDataAccess,()=>{console.log("Successfully Updated")})
        global.emit(globalDataAccessCall,model)
        model.emit(model.dbOpsType,model)
        
    })
    global.emit(globalDataAccessCall,model)
    model.emit(model.dbOpsType,model)
}

//exports
module.exports.init=init;