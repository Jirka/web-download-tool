function thedashWidget(console) {
	this.widget = null;
	this.document = new Document(null, console);

	this.init = function(html, config, level, parent)
	{
		this.widget = this.document.createAndInitWidget(html, config, level, parent);
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
	* searches for type in DOM according to class
	* @returns string type
	*/
	this.getType = function()
	{
		var type =  this.document.findClassOnLowerLevel(
			this.widget.supportedTypes,
			this.widget.html
		);
		
		type = "CHART";
		return type;
	};

	/*
	* forwarding instance of general widget
	* @returns Wigdet instance
	*/
	this.getWidget = function()
	{
		return this.widget;
	}
}