//initialize an express server
var express = require("express");
var app = express();

//defines what to do when receiving a get request for route "localhost:3000/"
//returns the index.html file
app.get("/", function(req, res){
  res.sendFile("index.html", {root: __dirname}, function(err){
    //check whether there is an error
    if(err){
      //if so, let the user know the file could not be found
      res.status(404).send("File not found!");  
    }else {
      console.log("index file found and sent!");
    }
  });
});

//this serves the javascript static file app.js
app.get("/javascript/app.js", function(req, res){
  res.sendFile("app.js", {root: __dirname+"/javascript/"}, function(err){
    //check whether there is an error
    if(err){
      //if so, let the user know the file could not be found
      res.status(404).send("File not found!");  
    }else {
      console.log("app.js found and sent!");
    }
  });
});

//starts the server at localhost:3000/
app.listen(3000, function(){
  console.log("The server is listening on port 3000");
});