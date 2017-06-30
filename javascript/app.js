//this module defines the whole application
var app = angular.module("vlApp", []);

//this controller controls the whole application
app.controller("vlCtrl", function($scope){
  /*
  * The format of this database will be as shown below:
  * videoDB = {"title of video1": {"url":"string", "description":"string", "tags":[string, string]}, "title of video2": ...}
  */
  $scope.videoDB = {};
  
  /*
  * The format of this database will be as shown below:
  * tagDB = {"tag1":[list of video titles], "tag2":[...]}
  */
  $scope.tagDB = {};
  
  //populate the video database
  populateVideoDB($scope);
  
});

function populateVideoDB($scope){
  //sends the request for the local file (asynchronously)
  var xhttp = new XMLHttpRequest();
  xhttp.open("GET", "https://s.ch9.ms/Feeds/RSS", true);
  
  //this is run when the request returns with content from the source
  xhttp.onload = function(){
    if(this.readyState == 4 && this.status == 200){
      //parse the xml file
      console.log("The file was retrieved!");
    }
  };
  
  //this is run when the request encounters an error and cannot get the content
  xhttp.onerror = function(){
    console.error("The file could not be retrieved. It returned with the following error: " + (this.statusText===""?"Cross-Origin Error":this.statusText));
  };
  
  xhttp.send();
}