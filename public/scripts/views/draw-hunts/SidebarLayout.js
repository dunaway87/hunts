var api = require('api/HuntsAPI');
var tmpl = require('draw-hunts/SidebarLayout.tmpl');
var RangeCompTmpl = require('draw-hunts/RangeCompTmpl.tmpl');
var RangeItemTmpl = require('draw-hunts/RangeItemTmpl.tmpl');
var FiltersCollectionTmpl = require('draw-hunts/FiltersCollectionTmpl.tmpl');
var SpeciesFiltersView = require('views/filters/SpeciesFilterView');
var UnitsFilterView = require('views/filters/UnitsFilterView');
var FilterModel	= require("models/FilterModel");
var SubunitsFilterView = require('views/filters/SubunitsFilterView');
var SuccessRateView = require('views/filters/SuccessRateView');
var DrawRateView = require('views/filters/DrawRateView');
var search_hunt_tmpl = require('draw-hunts/SearchHunt.tmpl');


module.exports = Backbone.Marionette.LayoutView.extend({
	template: tmpl,
	className: 'filters',

	regions:{
		species:"#species-container",
		units:"#units-container",
		subunits:"#subunits-container",
		successrate:"#successrate-container",
		drawrate:"#drawrate-container",
		search_hunt:".search-container",
		advanced_filters:"#advanced-filters-container"
	},

	events:{
		'click #advanced-filters-container':'switchArrow'
	},


	onShow: function(options){
		this.showFilters();
		log.debug("side layout")
		this.options.successrate={};
		this.options.drawrate={};

		
	},

	switchArrow:function(){
		var that = this;
		$(".arrow-down").toggle();
		$(".arrow-up").toggle();
		$(".success-head").toggle();
		$(".draw-head").toggle();
		that.showSliders();

	},

	showFilters: function(options){
			
		var that = this;
			$.getJSON(api.filters(), function(filters){
				
				that.options.successrate=filters.successrate;
				that.options.drawrate=filters.drawrate;
				log.debug("filters %o ", filters.species)
				var species_filters_view = new SpeciesFiltersView({
					model: new Backbone.Collection(filters.species.range)
				})

				var units_filter_view = new UnitsFilterView({
					model: new Backbone.Collection(filters.unit.range)
				})

				var subunits_filter_view = new SubunitsFilterView({
					model: new Backbone.Collection(filters.subunit.range)
				})

				var search_hunt = new SearchHunt();
				
				that.getRegion('search_hunt').show(search_hunt);
				that.getRegion('species').show(species_filters_view);
				that.getRegion('units').show(units_filter_view);
				that.getRegion('subunits').show(subunits_filter_view)

				search_hunt.on("search:hunt",function(searchTerm){
					console.log("search term %o ", searchTerm)
					var searchCQL="hunt = "+"\'"+searchTerm.toUpperCase()+"\'"
					that.options.wmsLayer.setParams({
						CQL_FILTER:searchCQL
					})	
				})


				var speciesCql= null;
				var unitsCql = null;
				var subunitsCql = null;

				that.options.CQL_PARAMS={};

				species_filters_view.on('hunt:filter',function(data){
					that.options.CQL_PARAMS.species=data.toLowerCase()
					that.setWMSParamsCQL()
				})

				
				units_filter_view.on('hunt:filter',function(data){
					that.options.CQL_PARAMS.unit=data
					that.setWMSParamsCQL()

				})	
				units_filter_view.on('hunt:panTo',function(data){
					that.trigger("panTo", data)

				})	
				subunits_filter_view.on('hunt:filter',function(data){
					that.options.CQL_PARAMS.subunit=data
					that.setWMSParamsCQL()
				})

			})

		},

		showSliders:function(){
			var that = this;
			that.showSuccesFilter(that.options.successrate);
			that.showDrawRate(that.options.drawrate);
		},

		setWMSParamsCQL: function(){
			var that = this;
			var cqlFilters = "1=1";
			for (var key in that.options.CQL_PARAMS) {
				if(that.options.CQL_PARAMS[key] != 'all' && that.options.CQL_PARAMS[key] != 'All'){
					cqlFilters = cqlFilters+" and "+key +"='"+ that.options.CQL_PARAMS[key]+"'";
				}
			}			

			that.options.wmsLayer.setParams({
				CQL_FILTER:cqlFilters
			})

		},
		addOriginalWms: function(speciesCql){
			var that = this;
			log.debug("hehesa")
			speciesCql=null;
			if(FilterModel.has("species")){
				FilterModel.unset("species", [])
			}
			that.options.wmsLayer.resetParams()
		},

		showSuccesFilter:function(data){
			var that =this;
			log.debug("successrate %o ", data.range)
			var successrate_view = new SuccessRateView(data.range)

			that.getRegion('successrate').show(successrate_view);

		},

		showDrawRate: function(data){
			var that= this;
			log.debug("draw %o ", data.range)
			var drawrate_view = new DrawRateView(data.range);
			var maxDraw={};
			var minDraw={};
			that.getRegion('drawrate').show(drawrate_view);
			FilterModel.on('change:maxDrawRate',function(model,maxDrawRate){
				console.log("change %o ", model.attributes.maxDrawRate);
				maxDraw = model.attributes.maxDrawRate;
				minDraw = model.attributes.minDrawRate;
				that.options.wmsLayer.setParams({
					CQL_FILTER:"draw_rate between "+ minDraw + " and " + maxDraw
				})
			})
			
		},


		initialize: function(options){
			this.options = options;
			log.debug("hehe %o ", options)
			this.model = new Backbone.Model();
		},


	}); 

var SearchHunt = Backbone.Marionette.ItemView.extend({
	template:search_hunt_tmpl,
	className:'sidebar-search',

	ui:{
		"searchKeyword":".search-hunt-input"
	},

	events:{
		"click #search-hunt-btn":"getSearchResult",
		'keyup .search-hunt-input': "keyPress"
	},

	keyPress:function(e){
		console.log("keyPress")
	
		if(e.which == 13){
			
			
			
			var searchTerm = this.ui.searchKeyword.val();
			console.log("search hunt %s ", searchTerm)
			this.trigger("search:hunt", searchTerm)
		}	
			
	},

	getSearchResult: function(e){
		e.preventDefault();
		//e.stopProgation();
		
		var searchTerm = this.ui.searchKeyword.val();
		console.log("search hunt %s ", searchTerm)
		this.trigger("search:hunt", searchTerm)
	}
		
})


