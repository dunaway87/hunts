var api = require('api/HuntsAPI');

var tmpl = require('draw-hunts/SummaryView.tmpl');
var header_tmpl = require('draw-hunts/ModalHeader.tmpl');
var footer_tmpl = require('draw-hunts/ModalFooter.tmpl');
var modal_map_tmpl = require('draw-hunts/ModalMapView.tmpl');
var hunt_item_tmpl = require('draw-hunts/HuntItem.tmpl');
var hunt_comp_tmpl =require('draw-hunts/HuntComp.tmpl');
var hunt_summary_tmpl = require('draw-hunts/HuntSummary.tmpl');
var hunt_summary_comp_tmpl = require('draw-hunts/HuntSummaryComp.tmpl');
var hunt_title_tmpl = require('draw-hunts/HuntTitle.tmpl')

//var modal_hunts_tmpl = require('draw-hunts/ModalHunts.tmpl');
//var modal_hunt_summary_tmpl = require('draw-hunts/ModalHuntSummary.tmpl');
var FilterModel = require('models/FilterModel');

module.exports = Marionette.LayoutView.extend({
	    
	template:tmpl,
	className:"modal",
	regions:{
		modal_map:'.modal-map-container',
		modal_hunts:'.modal-hunts',
		modal_hunt_title:'.hunt-summary-title',
		modal_hunt_summary:'.modal-hunt-summary',
		
		modal_footer:'#hunt-modal-footer',
	},

	events:{
		"keyup":"keyPress",
	},

	keyPress:function(e){
		console.log(e)
		if(e.which===27){
			this.trigger("close:modal")
		}
	},

	onShow: function(){
		require.ensure([], function() {
			require("leaflet/leaflet.css");
			require("leaflet/leaflet.js");
			require("leaflet/leaflet-src.js");
		});
		this.options.data = {}

		this.options.map={};
		this.options.wmsLayer={};
		this.options.geojson={};
		this.options.firstHunt={};
		//this.showModalHeader();
		this.showModalFooter();
		this.showModalMap();
		this.showHunts();
		//this.showHuntSummary();
		
			

	},



	showModalHeader: function(){
		var that = this;
		var modal_header_view = new ModalHeaderView();

		that.getRegion('modal_header').show(modal_header_view);
		modal_header_view.on('close:modal', function(){
			console.log("heheclose")
			that.trigger("shuttle:close");
		})


		//that.showHunts();

	},

	showModalFooter: function(){
		var that = this;

		var modal_footer_view = new ModalFooterView();
		that.getRegion('modal_footer').show(modal_footer_view);
		modal_footer_view.on('close:modal', function(){
			console.log("heheclose")
			that.trigger("shuttle:close");
		})
	},

	showModalMap:function(options){
		var that = this;
		
		that.getRegion('modal_map').show(new MapView(that.options))
	},

	showHunts:function(options){

		log.debug("filtermodel in  summaryview %o", FilterModel)

		var that = this;
		var lat = this.options.model.attributes.lat;
		var lon = this.options.model.attributes.lon;


		var url = api.pointData(lat,lon,rootUrl);
		if(FilterModel.has("species")){
			url = url +"&species="+FilterModel.get("species")
		}

		if(FilterModel.has("unit")){
			url = url +"&unit="+FilterModel.get("unit")
		}

		if(FilterModel.has("residence")){
			url = url +"&residence="+FilterModel.get("residence")
		}



		console.log(url);


		var hunt_model = Backbone.Model.extend({
			urlRoot: url
		});
		console.log(hunt_model)
		var HuntCollection = Backbone.Collection.extend({
			url: url,
			model: hunt_model,
			parse: function(response, options) {
    			return response.data;
    			
  			}

		});	

		var collection = new HuntCollection();
		var modal_hunts = {}
		var layergroup = new L.LayerGroup();

		collection.fetch().done(function(){
			console.log("collection %o ", collection)

			if(collection.models[0].attributes.properties){
			



				modal_hunts = new ModalHunts({
					collection:collection
				})
				that.getRegion('modal_hunts').show(modal_hunts)

				
				
				
					args = collection.models[0]
					var hunt_summary = new HuntSummaryView({
						model:args
					})
					var hunt_title_view = new HuntModalTitle({
						model:args
					})
				
					that.options.wmsLayer = L.tileLayer.wms('http://geoblaster.info:8080/geoserver/hunts/wms',{
						 layers:'hunts:draw_hunt',
						 format: 'image/png',
			        	 transparent: true,
			        	
					});

					that.options.wmsLayer.setParams({
						CQL_FILTER:"hunt = '"+args.attributes.label+"'"
					})
					that.options.map.addLayer(that.options.wmsLayer);
					that.options.map.setView([args.attributes.zoom.lat,args.attributes.zoom.lon],(7+args.attributes.zoom.zoom));

					that.getRegion('modal_hunt_summary').show(hunt_summary)
					that.getRegion('modal_hunt_title').show(hunt_title_view)



				modal_hunts.on("childview:show:huntsummary", function(childview,args){
					that.options.map.removeLayer(that.options.wmsLayer)
					console.log("hunt summary %o ", args)
					var hunt_summary = new HuntSummaryView({
						model:args
					})
					var hunt_title_view = new HuntModalTitle({
						model:args
					})
				
					console.log("hunt args %o ", args.attributes)
					
					
					
					//layergroup.clearLayers();

					//that.options.geojson = args.attributes.geometry
					//L.geoJSON(that.options.geojson).addTo(layergroup)
					//that.options.map.addLayer(layergroup);
					console.log(args.attributes.label)

					that.options.wmsLayer = L.tileLayer.wms('http://geoblaster.info:8080/geoserver/hunts/wms',{
						 layers:'hunts:draw_hunt',
						 format: 'image/png',
			        	 transparent: true,
			        	
					});

					that.options.wmsLayer.setParams({
						CQL_FILTER:"hunt = '"+args.attributes.label+"'"
					})
					that.options.map.addLayer(that.options.wmsLayer)
					that.options.map.setView([args.attributes.zoom.lat,args.attributes.zoom.lon],(7+args.attributes.zoom.zoom));

					that.getRegion('modal_hunt_summary').show(hunt_summary)
					that.getRegion('modal_hunt_title').show(hunt_title_view)
				})
			} else {
				that.trigger("shuttle:close");
			}
		});
	
			
		console.log("hunts up %o ", collection)

	},

	initialize: function(options){
		this.options = options;
		console.log("show modal options %o ", this.options);
		console.log("show modal model %o ", this.model)
	}

});	

var HuntModalTitle = Backbone.Marionette.ItemView.extend({
	template:hunt_title_tmpl,
	

	serializeData: function(){
		
		return {
			label:this.model.get("label"),
			
		}
	},
})




var ModalHeaderView = Backbone.Marionette.LayoutView.extend({
	template:header_tmpl,


	triggers:{
		"click .close": "close:modal",

	},




	closeModal:function(){
		var that = this;
		/*e.preventDefault();
		e.stopPropagation();*/
		console.log("close it down")
		this.trigger("close:modal")
	}
});

var ModalFooterView = Backbone.Marionette.ItemView.extend({
	template:footer_tmpl,

	triggers:{
		"click .footer-closer":"close:modal",
	},
	

	closeModal:function(e){
		e.preventDefault();
		e.stopPropagation();
		 
		this.trigger("close:modal")
	}
})



var HuntItem = Backbone.Marionette.ItemView.extend({
	template:hunt_item_tmpl,
	tagName:"li",
	className:"nav-item",
	
	ui:{
		nav_link:'nav-link'
	},

	events:{
		'click': "showModalHuntSummary"

	},
	onShow: function()	{
		if(this.model.get("childNumber")===0){
			$(this.$el.children()[0]).addClass('active')
		}
	},
	
	showModalHuntSummary: function(){

		$('.nav-link').removeClass('active');
		this.$el.children().addClass('active');
		console.log("hunt item view %o ", this.model)
		//$('td').addClass('.table-active');
		this.trigger("show:huntsummary", this.model)

	},

	serializeData: function(){
		var properties = this.model.attributes.properties["0"].value;
		return {
			label:this.model.get("label"),
			species:properties

		}
		
	},
	initialize:function(options){
		var that = this;
		if(options.model.get("childNumber") == 0){
			that.showModalHuntSummary();
			this.trigger("show:huntsummary", this.model)

		}
	}
	
})

var ModalHunts = Backbone.Marionette.CollectionView.extend({

	tagName:"ul",
	className:"nav nav-tabs",
	//template:hunt_comp_tmpl,
	childView: HuntItem,

	

	initialize:function(options){
		var that = this;
		this.options = options
		this.collection = new Backbone.Collection(this.options.collection.models)
		
	} 
})

var HuntModalTitle = Backbone.Marionette.ItemView.extend({
	template:hunt_title_tmpl,
	

	serializeData: function(){
		
		return {
			label:this.model.get("label"),
			
		}
	},
})

var HuntSummaryItem = Backbone.Marionette.ItemView.extend({
	template:hunt_summary_tmpl,
	className:'.hunt-summary-detail',
	tagName:'tr',
	serializeData: function(){
		var properties = this.model.attributes.properties;
		
		return {
			label:this.model.get("label"),
			value:this.model.get("value")

		}
	},


	initialize:function(options){
		this.options = options
		
	}
	
})

var HuntSummaryView = Backbone.Marionette.CompositeView.extend({
	template:hunt_summary_comp_tmpl,
	childView:HuntSummaryItem,
	tagName:"table",
	className:"table table-striped table-bordered",

	initialize:function(options){
		var that = this;
		this.options = options

		
		this.collection = new Backbone.Collection(this.model.attributes.properties)

		
	
	} 
})




var MapView = Marionette.View.extend({
	id:'modal-map',
	template:modal_map_tmpl,


	onShow:function(){	
		var that = this;
		
		that.options.map = L.map('modal-map',{
			center:[that.model.attributes.lat, that.model.attributes.lon],
			zoom:7,
					
					});
	    var mapboxID ='dunaway87.hffcoej7';
			
		var	basemap = L.tileLayer('https://{s}.tiles.mapbox.com/v3/'+mapboxID+'/{z}/{x}/{y}.png', {
			    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
				    baselayer: true

			});
		that.options.map.addLayer(basemap);
			
	},

	initialize:function(options){
		this.options=options
		console.log("hehe haha %o " ,this.options)
	}
				
})