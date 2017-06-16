'use strict'
// node dependencies
var mongoose=require('mongoose');
mongoose.Promise = require('bluebird');

// mongodb connection
module.exports=function(){
    mongoose.connect('mongodb://node123:nodedb123@ds127872.mlab.com:27872/notification123', function(err){
    if(err){
        console.log(err);
    } else{
        console.log('Connected to mongodb!');
    }
});
}