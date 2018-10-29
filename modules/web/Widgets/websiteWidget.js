function websiteWidget()
{	
	this.init = function(html, config, level, parent)
	{
		var generalWidget = new Widget(console);
		generalWidget.init(html, config, level, parent);
		this.generalWidget = generalWidget;

		//self instance
		this.object = config.customWidget;
	}

	this.execute = function()
	{	
		this.generalWidget.setCoordinates();
		this.generalWidget.setSubwidgets(this.getSubwidgets());
		this.generalWidget.getCssProperties();
	}
	
	this.getSubwidgets = function() 
	{
		var subwidgets = [];
		if (this.generalWidget.level <= this.generalWidget.maxLevel) {
			for (var i in this.generalWidget.html.children) {
				if (typeof this.generalWidget.html.children[i] === 'object') {
					
					var widget = new window[this.object](console);
					widget.init(
						this.generalWidget.html.children[i],
						this.generalWidget.config, 
						this.generalWidget.level+1,
						this.generalWidget
					);
					widget.execute();
					subwidgets.push(widget.getWidget());
				}
			}
		}
		return subwidgets;
	};

	/*
	* forwarding instance of general widget
	*/
	this.getWidget = function()
	{
		return this.generalWidget;
	}
};