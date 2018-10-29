function datapineWidget(console) {

	this.document = new Document(document, console);
	this.highcharts = new HighChartGraphs(console);
	
	this.widget = null;
	this.topLevelHtml = null;

	this.init = function(html, config, level, parent)
	{
		this.widget = this.document.createAndInitWidget(html, config, level, parent);

		//self instance --should be instance? widow[config.customWidget] ; new this.object();
		this.self = window[config.customWidget];

		if (level === 0) {
			//because this widget is representing whole dashboard
			this.widget.setSkip();
			this.topLevelHtml = html.children;
		}

		//initialization of highcharts
		this.highcharts.init(Highcharts, html);
	}

	this.execute = function()
	{
		this.widget.setCoordinates();
		this.widget.setType(this.getType());
		this.widget.setSubwidgets(this.getSubwidgets());
	}

	this.getType = function()
	{
		if (this.widget.level === 0) return '';

		var type = this.highcharts.getProperty('type');
		if (type === null) {
			//default type
		}

		return "CHART";
	};
	
	this.getSubwidgets = function()
	{
		if (this.widget.level > 1) return []; //just for now

		if (this.widget.level !== 0) {
			var newHier = this.document.createNewHierarchySS(this.topLevelHtml, this.widget.html)
		} 
		else {
			var newHier = this.document.createNewHierarchy(this.topLevelHtml);
		}

		var widgets = [];

		for (var i in newHier['html'].children) {
			if (typeof newHier['html'].children[i] === 'object' &&
				newHier['html'].children[i].hasAttribute('id')
			) {
				var id = newHier['html'].children[i].getAttribute('id');			

				 if (typeof newHier['elems'][id] === 'object') {
				 	//check if id exists?
					var widget = new this.self(console);
					widget.init(
						newHier['elems'][id],
						this.widget.config,
						this.widget.level + 1,
						this.widget
					);
					console.log('--------------------seting:::' + this.widget.level +1);
					widget.topLevelHtml = this.topLevelHtml;
					widget.execute();
					widgets.push(widget.widget);
				}
			}
		}

		return widgets;
	};

	/*
	* forwarding instance of general widget
	*/
	this.getWidget = function()
	{
		return this.widget;
	}
	
}