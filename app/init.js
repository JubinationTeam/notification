'use strict'

//data access
var genericDataAccess=require('jubi-mongoose-data-access');

//controller
var controllerInit=require('jubi-express-controller').init;

//services
var createSet=require('./services/createSet.js').init

//global event emitter
const EventEmitter = require('events');
class GlobalEmitter extends EventEmitter {   }
const globalEmitter = new GlobalEmitter();
globalEmitter.setMaxListeners(3);

//url variables
const postUrlDef='/:type';
const getUrlDef='/:type';

//valid url's
var validRequestEntities={
                            "post":["createSet","manager"],
                            "get":[]
                         };
     
const globalDataAccessCall='dataAccessCall';
const globalCallBackRouter='callbackRouter';

//variables required by controller init function
var routerInitModel={
        'globalEmitter':globalEmitter,
        'postUrlDef':postUrlDef,
        'getUrlDef':getUrlDef,
        'validRequestEntities':validRequestEntities,
        'callbackName':globalCallBackRouter,
        'nextCall':'service'
    };
//variables required by data access init function
var dataAccessInitModel={
        'globalEmitter':globalEmitter,
        'nextCall':'dataAccessCall'
    };

const guardKey="5923f40e07b1c909d06487ad";
const commonAccessUrl="https://ancient-shore-46511.herokuapp.com/commonAccess/";

//instantiating Handler,Service layer and Data Access layer
function init(){
                        
    controllerInit(routerInitModel);
    genericDataAccess(dataAccessInitModel);
    createSet(globalEmitter,'createSet',globalDataAccessCall)
  
}            

//exports
module.exports.init=init;