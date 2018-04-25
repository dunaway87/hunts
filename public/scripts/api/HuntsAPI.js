//ExampleAPI
module.exports = {
	filters: function() {
		return Mustache.render("{{{rootUrl}}}/api/hunts/filters", {rootUrl:rootUrl});
	},

	pointData: function(lat, lon){
		return Mustache.render("{{{rootUrl}}}/api/hunts/pointData", {rootUrl:rootUrl})
	}
	
}