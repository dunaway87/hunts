var tmpl = require('draw-hunts/DrawRate.tmpl');
var FilterModel = require('models/FilterModel');

module.exports = Backbone.Marionette.ItemView.extend({
	template:tmpl,
	className:".drawrate-slide",
	ui:{
		"drawrange":"#drawrange",
	},
	
	onShow: function(options){
		var that = this;
		var self = this;
		this.options = options
		var min = this.model.get("min");
		var max = this.model.get("max");
		log.debug("min in sho %o ", this.model.get("min"))
		this.ui.drawrange.slider({
			range:true,
			min: min,
			max: max,
			values:[ 20 ,50 ],
			change:self.getValues
		})



	},
	getValues:function(event, ui){
		var that = this;
		var self = this;
		if(FilterModel.has("minDrawRate")){
			FilterModel.unset("minDrawRate");
			FilterModel.set("minDrawRate",ui.values[ 0 ]);
		}

		if(FilterModel.has("maxDrawRate")){
			FilterModel.unset("maxDrawRate");
			FilterModel.set("maxDrawRate",ui.values[ 1 ]);
		}
		
		
		
		/*FilterModel.get("drawMin").push(ui.values[ 0 ]);
		FilterModel.get("drawMax").push(ui.values[ 1 ]);*/
		log.debug("filter model %o ", FilterModel)
		
	},



	initialize: function(options){
		this.options = options;
		this.model = new Backbone.Model(this.options);
		if(!(FilterModel.has("minDrawRate"))){
			FilterModel.set("minDrawRate",[]);
		}
		if(!(FilterModel.has("maxDrawRate"))){
			FilterModel.set("maxDrawRate",[]);
		}		

		
		log.debug("model %o ", this.model)
	}
})