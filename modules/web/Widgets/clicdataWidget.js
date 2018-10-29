function clicdataWidget(console) {

	this.document = new Document(document, console);
	this.highcharts = new HighChartGraphs(console);
	this.widget = null; //should this be here

	this.init = function(html, config, level, parent)
	{
		this.widget = this.document.createAndInitWidget(html, config, level, parent);

		//self instance --should be instance? widow[config.customWidget] ; new this.object();
		this.object = config.customWidget;

		//initialization of highchart with environment variable
		this.highcharts.init(Highcharts, html);
	}

	/*
	* synchronization to general widget
	*/
	this.execute = function()
	{
		this.widget.setCoordinates();
		this.widget.setType(this.getType());
		this.widget.setSubwidgets(this.getSubwidgets());
	}

	/*
	* 
	* @returns string type
	*/
	this.getType = function() {		
		var type =this.highcharts.getProperty('type');
		if (type === null) {
			type = this.document.findClassOnLowerLevel(
				this.widget.supportedTypes,
				this.widget.html
			);
		}

		return "CHART";
	};
	
	this.getSubwidgets = function() {
		var subwidgets = [];

		if (this.highcharts.hasSubwidgets()) {
			var ids = this.highcharts.ids;
			for (var i in ids) {
				var widget = new window[this.object](console);
				widget.init(
					this.highcharts.charts[ids[i]].obj,
					this.widget.config, 
					this.widget.level+1,
					this.widget.coordinates
				);
				widget.execute();
				subwidgets.push(widget.getWidget());
			}
		}
		
		return subwidgets;
	};

	/*
	* forwarding instance of general widget
	* @returns Widget instance
	*/
	this.getWidget = function()
	{
		return this.widget;
	};
}