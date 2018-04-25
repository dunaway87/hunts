//ExampleAPI
module.exports = {
	filters: function(rootUrl) {
		return Mustache.render("{{{rootUrl}}}/api/hunts/filters", {rootUrl:rootUrl});
	},

	pointData: function(lat, lon,rootUrl){
		return Mustache.render("{{{rootUrl}}}/api/hunts/pointData", {rootUrl:rootUrl})
	}
	
}