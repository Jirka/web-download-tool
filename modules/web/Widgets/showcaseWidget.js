function showcaseWidget() {

	this.widget = null;
	this.self = null;

	this.init = function(html, config, level)
	{
		this.widget = this.document.createAndInitWidget(html, config, level);

		this.self = widnow[config.customWidget];
	}

	/*
	* synchronization to general widget
	*/
	this.execute = function()
	{
		this.widget.setCoordinates();
		this.widget.setType(this.getType());
	}

	/*
	* @returns string type
	*/
	this.getType = function() {
		var type =  this.widget.document.findClassOnLowerLevel(
			this.widget.supportedTypes, 
			this.widget.html
		);

		type = "CHART";
		return type;
	};
	
	this.getSubwidgets = function() {
		
	};

	/*
	* forwarding instance of general widget
	* @returns Widget instance
	*/
	this.getWidget = function()
	{
		return this.widget;
	}
}
