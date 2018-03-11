function Service(console) {
	this.widgets = []; //reference to top level widgets

	//default properties
	this.width = 0;
	this.height = 0;
	this.marginX = 0;
	this.marginY = 0;

	/*
	* 
	*/
	this.execute = function(config)
	{
		var dDocument = new Document(document);
		var widgets = dDocument.findWidgets(config.selector);

		this.width = config.width;
		this.height = config.height; 
		this.marginX = config.marginX;
		this.marginY = config.marginY;

		for (var i in widgets) {
			if (typeof widgets[i] === 'object') {
				var widget = new window[config.customWidget](console);
				widget.init(widgets[i], config, 0);
				widget.execute();
				this.widgets.push(widget.getWidget());
			}
		}
	};

	/*
	* @returns string
	*/
	this.generateDashboardXML = function() {
		var output = "<dashboard>";
		output += "<x>"+this.marginX+"</x>";
		output += "<y>"+this.marginY+"</y>";
		output += "<width>"+this.width+"</width>";
		output += "<height>"+this.height+"</height>";

		for (var i in this.widgets) {
			output += this.widgets[i].generateXML();
		}

		output += "</dashboard>";
		return output;
	}

	this.getNewWindowSize = function()
	{
		var minY = this.height; var maxY = 0;
		var minX = this.width; var maxX = 0;

		for (var i in this.widgets) {
			var coordinates = this.widgets[i].getCoordinates();
			coord = (coordinates.coord === null) ? coordinates.subCoord : [coordinates];

			for(var j in coord) {
				console.log(coord[j].coord.x + " " + coord[j].coord.y);
				minX = Math.min(coord[j].coord.x, minX);
				minY = Math.min(coord[j].coord.y, minY);
				maxX = Math.max(coord[j].coord.x + coord[j].coord.width, maxX);
				maxY = Math.max(coord[j].coord.y + coord[j].coord.height, maxY);
			}
		}

		this.width = maxX - minX;
		this.height = maxY - minY;

		this.recalculateCoordinates(minX, minY);

		return {width : this.width, height : this.height, x : minX, y : minY};
	}


	this.recalculateCoordinates = function(minX, minY)
	{
		for (var i in this.widgets) {
			this.widgets[i].subtractCoordinates(minX, minY);
		}
	}

	/*
	* @retuns array
	*/
	this.getWidgetsCoordinates = function()
	{
		var coordinates = [];

		for (var i in this.widgets) {
			coordinates.push(this.widgets[i].getCoordinates());
		}

		return coordinates;
	}
}