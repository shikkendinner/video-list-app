//initialize an express server
var express = require("express");
var app = express();

//utilize the request package to make HTTP requests 
var request = require("request");

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

//http request is performed to retrieve the rss feed which is returned to be processed by the frontend
app.get("/getRSS", function(req, res){
  var options = {
    method: "GET",
    uri: "https://s.ch9.ms/Feeds/RSS"
  };
  request(options, function(error, response, body){
    if(error) res.status(400).send(error);
    if(response.statusCode == 200) {
      res.set("Content-Type", "text/xml");
      res.send(body);
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

//this serves the css static file index.css
app.get("/css/index.css", function(req,res){
  res.sendFile("index.css", {root: __dirname+"/css/"}, function(err){
    //check whether there is an error with getting the file
    if(err){
      res.status(404).send("File not found!");
    }else {
      console.log("index.css found and sent!");
    }
  });
});

//starts the server at localhost:3000/
app.listen(3000, function(){
  console.log("The server is listening on port 3000");
});