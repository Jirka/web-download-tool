function MockService(){

	this.services = {
		"klipfolio" : {
			"urls" : [
				"https://app.klipfolio.com/published/1c5149c071b2177cbf4b87e1c4f80ce3/facebook-ads-dashboard--public-demo#",
				"https://app.klipfolio.com/published/bc5e9f4bedb25b77c3b33acbb6c39a05/social-media-dashboard#",
			], 
			"selector" : ".item-container"
		},
		"thedash" : {
			"urls" : [
				"https://www.thedash.com/dashboard/HkhehWRDl/fullscreen",
				"https://www.thedash.com/dashboard/ePLKrnQ1sO",
				"https://www.thedash.com/dashboard/TPRZzNSGwq",
				"https://www.thedash.com/dashboard/eTLqN9Qs99", //#3
				"https://www.thedash.com/dashboard/eevIT7ceUO",
				"https://www.thedash.com/dashboard/TT798Fc2BU",
				"https://www.thedash.com/dashboard/TVrzPjviRU" //#6
			], 
			"selector" : ".wob"
		},
		"clicdata" : {"urls" : ["https://marketplace.clicdata.com/v/SWGA1ujxvVxJ"], "selector" : ".widget"},
		"datapine" : {"urls" : ["https://public.datapine.com/?_ga=2.212564564.1175535159.1499506636-524004421.1499506634#board/CtuM3QfKIg5u31jeInXZSB","https://public.datapine.com/?_ga=2.120758411.2065401221.1504434555-524004421.1499506634#board/DS1Cw8j9c45cOwBMUVX6fK"], "selector" : ".widget_GizmoGrid__gizmos"},
		"showcase" : {
			"urls" : [
				"https://showcase.bime.io/dashboard/Financial-Results/tab/500036",
				"https://showcase.bime.io/dashboard/GoogleAdwordsCampaignMonitorMixedData"
			], 
			"selector" : "bime-widgets bime-widget"
		},
		"databox" : {"urls" : ["https://app.databox.com/datawall/0353ef3669c57e8f8ea9912287d91069058d24661"], "selector" : '.grid-stack-item'},
		"geckoboard" : {"urls" : ["https://share.geckoboard.com/dashboards/KZFZFZLYA3UYIOZO/inception"], "selector" : ".widget"},
		"test" : {"urls" : ['https://www.w3.org/People/mimasa/test/'], "selector" : "none"}
	};

	this.get = function(name, index){
		if(this.services[name] === undefined) return false;

		var service = {};
		service.url = ((this.services[name].urls[index] !== undefined) ? this.services[name].urls[index] : this.services[name].urls[0]);
		service.selector = this.services[name].selector;
		service.service = name;

		return service;
	};

}

exports.create = function(){
	return new MockService();
}