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
app.controller("vlCtrl", ["$scope", "$http", function($scope, $http){
  /*
  * The format of this database will be as shown below:
  * videoDB = {"title of video1": {"url":"string", "description":"string", "tags":[string, string], show: boolean}, "title of video2": ...}
  */
  $scope.videoDB = {};
  
  //populate the video & tag database
  populateDatabases($scope, $http);
  
  //if the box denoted titleArea is clicked, then this function is called which either displays or hides the description
  $scope.updateDescriptionView = function(clickEvent, title){
    if($scope.videoDB[title].show){
      //hide the description
      $scope.videoDB[title].show = false;
      //check whether this is the div with the id "titleArea", if not go the parent node and change the class
      //the class is changed to change the css style of the div such that it is in clicked mode
      if(clickEvent.target.id === "titleArea"){
        clickEvent.target.removeAttribute("class");  
      }else{
        clickEvent.target.parentNode.removeAttribute("class");
      }
    } else {
      //show the description
      $scope.videoDB[title].show = true;
      //check whether this is the div with the id "titleArea", if not go the parent node and change the class
      //the class is changed to change the css style of the div such that it is in clicked mode
      if(clickEvent.target.id === "titleArea"){
        clickEvent.target.setAttribute("class", "active");  
      }else{
        clickEvent.target.parentNode.setAttribute("class", "active"); 
      }
    }
  };
  
  //this displays the video or removes it
  $scope.updateVideoView = function(clickEvent , title){
    //this will not send the click event up to the div holding the title and tags, causing the description to open or close
    clickEvent.stopPropagation();
    
    if($scope.videoDB[title].displayVideo){
      //hide the video
      $scope.videoDB[title].displayVideo = false;
      //remove the active class from the button and modify the html so that the button is returned to its normal state
      clickEvent.target.removeAttribute("class");
      clickEvent.target.innerHTML = "Watch Video";
    }else {
      //display the video
      $scope.videoDB[title].displayVideo = true;
      //set the class attribute to "active" so that the button's color changes and change the html so the button becomes a "Remove Video" button
      clickEvent.target.setAttribute("class", "active");
      clickEvent.target.innerHTML = "Remove Video";
    }
  };
  
  //this filters the video with the particular title or tag by checking whether the search term contains a part of the title or tag (depending on which of the two is picked from the dropdown list)
  $scope.filterVideo = function (title, searchType, searchWord){
    var result = false;
    if(searchWord !== undefined){
      var trimmedSW = searchWord.trim();
      var pattern = new RegExp(trimmedSW, "i");
      //check first if the search refers to a tag or a title
      if(searchType === "title"){
        //case insensitive search
        result = pattern.test(title);
      } else {
        //its a search involving tags, get the tags from the database for the particular title and compare the searchWord to them
        var tags = $scope.videoDB[title].tags;

        for(var i=0; i<tags.length; i++){
          //case insensitive search, if found one match, the video is filtered in
          if(pattern.test(tags[i])){
            result = true;
            break;
          }
        }

        //this accepts videos with no tags when a empty string is searched
        if(tags.length === 0 && trimmedSW.length === 0){
          result = true;
        }
      }
    } else {
      //nothing searched, so just display this video
      result = true;
    }
    
    return result;
  };
}]);

function populateDatabases($scope, $http){
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
          
          //set the show boolean for this video to false so the description is hidden
          $scope.videoDB[title].show = false;
          
          //set the displayVideo boolean for this video to false so the video player doesn't show
          $scope.videoDB[title].displayVideo = false;

          //get the url to the mp4 file of the video
          $scope.videoDB[title].url = enclosure[0].attributes.getNamedItem("url").nodeValue;

          //get the description for the video
          $scope.videoDB[title].description = video.getElementsByTagName("summary")[0].childNodes[0].nodeValue;

          //get the tags for the video, and store it within the database
          //if a video does not have a tag, it will not be in the database
          var tags = video.getElementsByTagName("category");
          $scope.videoDB[title].tags = [];

          for(var j=0; j<tags.length; j++){
            var tagName = tags[j].childNodes[0].nodeValue;

            //add tag to video database tag list for this particular video
            $scope.videoDB[title].tags.push(tagName);
          }
        }
      }
    }, function errorCallback(response){
        //this is run when the request encounters an error and cannot get the content
        console.error("The file could not be retrieved. It returned with the following error: " + (response.statusText===""?"Cross-Origin Error":response.statusText));
    });
}
