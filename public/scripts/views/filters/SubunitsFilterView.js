var RangeCompTmpl = require('draw-hunts/RangeCompTmpl.tmpl');
var RangeItemTmpl = require('draw-hunts/RangeItemTmpl.tmpl');

var FilterModel = require('models/FilterModel');
var SubUnitsRangeItemView = Backbone.Marionette.ItemView.extend({
	template:RangeItemTmpl,
	tagName:"option",
	

	initialize: function(options){
		this.options = options
	}
});

module.exports = Backbone.Marionette.CompositeView.extend({
	template:RangeCompTmpl,

	childView:SubUnitsRangeItemView,
	tagName: "select",

	events:{
		"change": "getSubUnit"
	},

	onShow: function(){
		var that = this;
		
			
		
		
		var select = this.$el.select();
		
		select.select2({
			//data: this.collection,
			dropdownAutoWidth : true,
    		width: 'auto',
			placeholder:"Select Unit",
					
			minimumResultsForSearch: 99,
		})


	},

	getSubUnit: function(){
		 var model = this.collection.at($(':selected', this.$el).index()).attributes;
		 log.debug("subunit model %o: ", this.collection.at($(':selected', this.$el).index()).attributes)
	
		 this.trigger("hunt:filter", model.label);
	},

	initialize:function(options){
		var that = this;
		this.options = options
		
		this.collection = new Backbone.Collection(this.options.model.models);
		this.collection.unshift({label:"All",value:"-1"});
		
		
	}

})