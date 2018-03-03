function websiteWidget()
{
	
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
		this.generalWidget.setSubwidgets(this.getSubwidgets());
	}
	
	this.getSubwidgets = function() 
	{
		var subwidgets = [];
		if (this.generalWidget.level <= this.generalWidget.maxLevel) {
			// console.log('level::'+this.generalWidget.level+' max::'+this.generalWidget.maxLevel);
			for (var i in this.generalWidget.html.children) {
				if (typeof this.generalWidget.html.children[i] === 'object') {
					
					var widget = new window[this.object](console);
					console.log('creating subwidget'+this.generalWidget.html.children[i]);
					widget.init(
						this.generalWidget.html.children[i], 
						this.generalWidget.config, 
						this.generalWidget.level+1
					);
					widget.execute();
					subwidgets.push(widget.getWidget());
				}
				else{
						//just for debug
						// console.log(this.html.children[i]);
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