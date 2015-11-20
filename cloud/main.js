require('cloud/app.js');
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
  	response.success("Hello world!");
});

// Send push to users from determined location
// TODO: add more fields: https://www.parse.com/docs/js/guide#push-notifications-sending-options
Parse.Cloud.define("sendPushToLocation", function(request, response) {
  	var userObjectId = request.params.userObjectId;

  	// FIXME: this is only temporary. We need to find a way to do this with roles!
  	if(userObjectId != "dpbBxLtkMY" && userObjectId != "4r1i9gZkYD") {
  		response.error("Permission denied! User is not an admin.");
  		return;
  	}
  
	var latitude = request.params.latitude;
	var longitude = request.params.longitude;
	if(latitude != null && longitude != null) {
		var locationGeoPoint = new Parse.GeoPoint({latitude: latitude, longitude: longitude});
	}

	// Validate the message text.
	var message = request.params.message;
	
	// Make sure it is under 140 characters
	if (message.length > 140) {
		// Truncate and add a ...
		message = message.substring(0, 137) + "...";
	}

	var title = request.params.title;
	var uri = request.params.uri;
	var recipientUserId = request.params.recipientId;
	
	// Push query
	var pushQuery = new Parse.Query(Parse.Installation);

	if(recipientUserId != null) {
		var recipientUser = new Parse.User();
		recipientUser.id = recipientUserId;
		pushQuery.equalTo("user", recipientUser);
	}
	else if(locationGeoPoint != null) {
		// Find users near given location (100 miles)
		var userQuery = new Parse.Query(Parse.User);
		userQuery.withinMiles("location", locationGeoPoint, 100.0);
		pushQuery.matchesQuery('user', userQuery);
		// TODO: confirm that this works with more than 1000 users!
	}	

	// Send the push notification to results of the query
	Parse.Push.send({
		where: pushQuery,
		data: {
	 		alert: message, // the notification's message.
	 		title: title, //(Android, Windows 8, & Windows Phone 8 only) the value displayed in the Android system tray or Windows 8 toast notification.
	 		uri: uri // (Android only) an optional field that contains a URI. When the notification is opened, an Activity associated with opening the URI is launched.
		}
	}).then(function() {
	 	response.success("Push foi enviado com sucesso!");
	}, function(error) {
	 	response.error("Falha ao enviar o push: " + error.message);
	});
});
