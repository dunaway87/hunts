var api = require('api/HuntsAPI');

var routes = require('routes/HuntsRoutes');

var tmpl = require('draw-hunts/DrawHuntsLayout.tmpl');
var SidebarView = require('views/draw-hunts/SidebarLayout');
var MapViewTmpl = require('draw-hunts/MapView.tmpl');
var RangeCompTmpl = require('draw-hunts/RangeCompTmpl.tmpl');
var RangeItemTmpl = require('draw-hunts/RangeItemTmpl.tmpl');
var SpeciesFiltersView = require('views/filters/SpeciesFilterView');
var UnitsFilterView = require('views/filters/UnitsFilterView');
var SummaryModalView = require('views/summary/SummaryView');
//DrawyHuntsView
module.exports = Backbone.Marionette.LayoutView.extend({
	template:tmpl,
	className: '.draw-hunts',

	regions:{
		map:"#map-container",
		sidebar_container:"#sidebar-container",
		summary_modal:"#summary-modal",
	},



	onShow:function(){
		require.ensure([], function() {
			require("leaflet/leaflet.css");
			require("leaflet/leaflet.js");
			require("leaflet/leaflet-src.js");
		});

		

		this.options.wmsLayer={};
		this.options.filterLayer={};
		this.options.map={};
		this.options.speciesFilter={};

		
		this.showSidebar(this.options);
		this.showMap();


        

	},

	showSidebar:function(options){
		this.getRegion('sidebar_container').show(new SidebarView(options));
	},


	showMap:function(options){
		var that = this;
		log.debug("show map hehe %o ", that.options)
		var map_view = new MapView(that.options)
		that.getRegion('map').show(map_view);
		

		map_view.on('hunt:summary',function(data){
			$('#summary-modal').show();
			var summary_modal_view = new SummaryModalView({
				model:data
			})
			summary_modal_view.on("shuttle:close", function(){
				console.log("closer")
				that.getRegion('summary_modal').empty({preventDestroy:true})
				$('#summary-modal').css("display","none");
			})
						that.getRegion('summary_modal').show(summary_modal_view,{preventDestroy:true})

		})

		
	},




	initialize: function(options){
		this.options = options;

		this.model = new Backbone.Model();
	}


	}); 




var MapView = Marionette.View.extend({
	id:'map',
	template:MapViewTmpl,

	/*events:{
		'dblclick':'getSummary'
	},

	getSummary: function(){
		this.trigger('hunt:summary')
	},*/

	onShow:function(){	
		var that = this;

		//this.getDomPoints();
		that.options.map = L.map('map',{
			center:[61.15,-149.9],
			zoom:4,
				
		});
		that.options.map.doubleClickZoom.disable();
	    var mapboxID ='dunaway87.hffcoej7';
			
		var	basemap = L.tileLayer('https://{s}.tiles.mapbox.com/v3/'+mapboxID+'/{z}/{x}/{y}.png', {
			    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
				    baselayer: true

			});
			that.options.wmsLayer = L.tileLayer.wms('http://geoblaster.info:8080/geoserver/hunts/wms',{
				 layers:'hunts:draw_hunt',
				 format: 'image/png',
	        	 transparent: true,
	        	 
			});
			that.options.map.addLayer(basemap)
			that.options.map.addLayer(that.options.wmsLayer)
			var lat
			var lon

			that.options.map.clicked=0;

			

			that.options.map.on('click', function(e){
				
				that.options.map.clicked = that.options.map.clicked+1;
				setTimeout(function(){
			        if(that.options.map.clicked == 1){
			        	lat = e.latlng.lat;
						lon = e.latlng.lng;
			            that.options.point_model=new Backbone.Model({
							lat:lat,
							lon:lon
						})

				
						that.trigger('hunt:summary', that.options.point_model);               
			            that.options.map.clicked = 0;
			        }
			     }, 300);
			})
			that.options.map.on('dblclick', function(e){
			    that.options.map.clicked = 0;
			    that.options.map.setView(new L.LatLng( e.latlng.lat, e.latlng.lng),that.options.map.getZoom()+1)
			    //that.options.map.zoomIn();
			   
			});

/*	
			that.options.map.on('dblclick',function(e){
				log.debug("hehehs")
				lat = e.latlng.lat;
				lon = e.latlng.lng;
				that.options.point_model=new Backbone.Model({
					lat:lat,
					lon:lon
				})

				
				that.trigger('hunt:summary', that.options.point_model);
				console.log("lat %o ", lat);
				console.log("lon %o ", lon);
				
			})*/
			
			log.debug("has it o: ", that.options.map.hasLayer(that.options.wmsLayer))
			log.debug("map options %o ",that.options)
	},

	startTimer:function(event){
		var timer = setTimeout(function(){
			console.log("clicky poo")
		},3000)
			
	

	},

	getDomPoint:function(){

	},
	

	initialize:function(options){
		this.options=options
	}
				
})




//DrawHuntsView