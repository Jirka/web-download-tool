function geckoboardWidget() {

	//dependencies : Document

	this.init = function(html, config, level)
	{
		var generalWidget = new Widget(console);
		generalWidget.init(html, config, level);
		this.generalWidget = generalWidget;

		//self instance --should be instance? widow[config.customWidget] ; new this.object();
		this.object = config.customWidget;
	}

	this.execute = function()
	{
		this.generalWidget.setCoordinates();
		this.generalWidget.setType(this.getType());
	}

	this.getType = function() {
		var type =  this.generalWidget.document.findClassOnLowerLevel(
			this.generalWidget.supportedTypes, 
			this.generalWidget.html
		);
		
		type = "CHART";
		return type; //return can be called directly
	};
	
	this.getSubwidgets = function() {
		
	};

	/*
	* forwarding instance of general widget
	*/
	this.getWidget = function()
	{
		return this.generalWidget;
	}

}