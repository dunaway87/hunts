var Routing = require('routers/Routing');
var DrawHuntsView = require('views/draw-hunts/DrawHuntsView');

//Router
module.exports = Backbone.Router.extend({
	routes: {
		'/hunts': 'drawHunts',
		
	},
	drawHunts: function() {
		log.debug('HuntsRouter.drawHunts');

		app.m.getRegion('main').show(new DrawHuntsView());
	}
	
}); //router