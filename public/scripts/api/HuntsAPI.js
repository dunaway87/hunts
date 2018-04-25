//ExampleAPI
module.exports = {
	filters: function(rootUrl) {
		return Mustache.render("{{{rootUrl}}}/api/filters", {rootUrl:rootUrl});
	},

	pointData: function(lat, lon,rootUrl){
		return Mustache.render("{{{rootUrl}}}/api/pointData?lat={{lat}}&lon={{lon}}", {rootUrl:rootUrl,lat:lat,lon:lon})
	}
	
}