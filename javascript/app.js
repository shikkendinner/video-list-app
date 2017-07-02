//this module defines the whole application
var app = angular.module("vlApp", []);

//this configuration allows the acceptance of loading URLs from outside the domain on which this application resides, which by default rejects any and all urls outside of this domain
app.config(function($sceDelegateProvider){
  //the urls that are allowed
  $sceDelegateProvider.resourceUrlWhitelist([
    //allow all links with the same origins
    "self",
    //allow all links with the ch9 origin for videos
    "http://video.ch9.ms/ch9/**"
  ]);
});

//this controller controls the whole application
app.controller("vlCtrl", function($scope, $http){
  /*
  * The format of this database will be as shown below:
  * videoDB = {"title of video1": {"url":"string", "description":"string", "tags":[string, string]}, "title of video2": ...}
  */
  $scope.videoDB = {};
  
  /*
  * The format of this database will be as shown below:
  * tagDB = {"tag1":[list of video titles], "tag2":[...]}
  */
  var tagDB = {};
  
  //populate the video & tag database
  populateDatabases($scope, tagDB, $http);
});

function populateDatabases($scope, tagDB, $http){
  //sends the request for the rss feed file (asynchronously)
  $http({
    method:"GET", 
    url:"/getRSS"
  }).then(function successCallback(response){
      //this is run when the request returns with content from the source
      //parse the xml file
      console.log("The file was retrieved!");

      //use the XML DOM parser to parse the response data text
      var parser = new DOMParser();
      var xmlDoc = parser.parseFromString(response.data, "text/xml");

      //get the list of <item> tag elements which contain information for each article within the RSS feed
      //store information per video found in videoDB
      var rssXML = xmlDoc.getElementsByTagName("item");
      for(var i=0; i<rssXML.length; i++){
        var video = rssXML[i];

        //check whether a <enclosure> tag exists, which probably indicates a video file (rarely a mp3 file)
        var enclosure = video.getElementsByTagName("enclosure");
        if(enclosure.length !== 0){
          //get the title of the video and store it within the database with an empty object
          var title = video.getElementsByTagName("title")[0].childNodes[0].nodeValue;
          $scope.videoDB[title] = {};

          //get the url to the mp4 file of the video
          $scope.videoDB[title].url = enclosure[0].attributes.getNamedItem("url").nodeValue;

          //get the description for the video
          $scope.videoDB[title].description = video.getElementsByTagName("summary")[0].childNodes[0].nodeValue;

          //get the tags for the video, and store this video's title for each tag within the tag database
          //if a video does not have a tag, it will not be in the tag database
          var tags = video.getElementsByTagName("category");
          $scope.videoDB[title].tags = [];

          for(var j=0; j<tags.length; j++){
            var tagName = tags[j].childNodes[0].nodeValue;

            //add tag to video database tag list for this particular video
            $scope.videoDB[title].tags.push(tagName);

            //check if tag exists within tag database, in either case, add this video's title to the tag database
            if(!tagDB.hasOwnProperty(tagName)){
              tagDB[tagName] = [];
            }
            tagDB[tagName].push(title);
          }
        }
      }
    }, function errorCallback(response){
        //this is run when the request encounters an error and cannot get the content
        console.error("The file could not be retrieved. It returned with the following error: " + (response.statusText===""?"Cross-Origin Error":response.statusText));
    });
}