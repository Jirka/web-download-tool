function clicdataWidget(console) {

	this.document = new Document(document, console);
	this.highcharts = new HighChartGraphs(console);
	this.widget = null; //should this be here

	this.init = function(html, config, level)
	{
		this.widget = this.document.createAndInitWidget(html, config, level);

		//self instance --should be instance? widow[config.customWidget] ; new this.object();
		this.object = config.customWidget;

		//initialization of highchart with envirement variable
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

		// should find out whether it is not in its bounds?
		//think whether its logical to keep here, when I dont have any test cases, or let it be same for highcharts?
		if (this.highcharts.hasSubwidgets()) {
			console.log('has subwidgets');
			var ids = this.highcharts.ids;
			for (var i in ids) {
				var widget = new window[this.object](console);
				widget.init(
					this.highcharts.charts[ids[i]].obj,
					this.widget.config, 
					this.widget.level+1
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