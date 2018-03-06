function klipfolioWidget(console) {

	this.json = null;
	this.widget = null;
	this.id = null;
	
	//should be in config
	this.showMenu = true;

	this.highcharts = new HighChartGraphs(console);
	this.document = new Document(document, console);

	this.init = function(html, config, level)
	{
		this.widget = this.document.createAndInitWidget(html, config, level);

		if (level === 0) {
			this.json = this.getJson();
		}

		this.highcharts.init(Highcharts, html);
	}

	/*
	* synchronization to general widget
	*/
	this.execute = function()
	{
		this.synchronizeHtml()
		this.widget.setCoordinates();
		this.widget.setType(this.getType());
		// this.widget.setSubwidgets(this.getSubwidgets());
	}

	/*
	* searches for json inside environment variable
	* @returns object 
	*/
	this.getJson = function()
	{
		for (var i in dashboard.klips) {
			if (("gridklip-" + dashboard.klips[i].id) === this.widget.html.id) {
				return dashboard.klips[i].serialize();						
			}
		}
		return null;
	}

	/*
	* searches for DOM object according to json top level id
	*/
	this.synchronizeHtml = function()
	{
		if (this.json !== null) {
			this.id = this.json.id;

			var html = document.getElementById(this.id);

			this.widget.html = html;
		}
	}

	this.getType = function() {
		
		//better check
		// if (this.json !== null) {
		// 	//this should be combination of klipfolio json and highcharts

		// 	// console.log('KlipTypes::'+this.findFirstLevelTypes(json.components, {}));
		// 	//return this.tyype(json.components, {});
		// 	// console.log('numberOfComponents::'+this.json.components.length);
		// 	console.log("---------------------START-----------------------");
		// 	return this.getDetails(this.json.components);

		// }

		return 'CHART';

	}

	this.getDetails = function(node) {
		var types = [];
		
		if (node === undefined) {
			return [];
		}

		for (var i in node) {
			if (node[i].type === 'panel_grid') {
				var tmp = this.getDetails(node[i].components);
				console.log(tmp);
				if (tmp.length === 1) {
					// tmp[0] === 
				}
			}
			else if (node[i].type === 'input') {
				return (node[i].displayName === 'Drop-Down List') ? ['menu'] : ['input'];
			}
			else{
				types.push(node[i].type);
			}
		}

		return types;
	}



	this.getSubwidgets = function(node) {		
		var widgets = [];

		for (var i in node) {
			if (node[i].type !== 'panel_grid') continue;

			var widget = new window[this.widget.customWidget](console);
			widget.init(
				this.widget.html,
				this.widget.config,
				this.widget.level + 1
			);
			// console.log('id pred '+node[i].id);
			widget.json = node[i];
			widget.execute();
			widgets.push(widget.widget);
		}
		
		return widgets;
	};

	/*
	* forwading of general widget
	* @return Widget instance
	*/
	this.getWidget = function()
	{
		return this.widget;
	}


}