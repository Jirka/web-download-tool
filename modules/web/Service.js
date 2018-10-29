function Service(console) {
	this.widgets = []; //reference to top level widgets

	//default properties
	this.width = 0;
	this.height = 0;
	this.marginX = 0;
	this.marginY = 0;
	this.useRelativeCoordinates = false;
	this.executingService = false;
	this.maximumHierarchyLevel = 1;
	this.removeElementFromArray = 0;
	this.removeElementsBiggerThan = 101;
	this.offset = 0;
	this.service = '';

	/*
	* finds widgets in DOM and creates instance of widget of concreate service 
	*/
	this.execute = function(config)
	{
		var dDocument = new Document(document);
		var widgets = dDocument.findWidgets(config.selector);

		this.width = config.width;
		this.height = config.height; 
		this.marginX = config.marginX;
		this.marginY = config.marginY;
		this.useRelativeCoordinates = config.useRelativeCoordinates;
		this.executingService = config.executingService;
		this.maximumHierarchyLevel = config.maximumHierarchyLevel;
		this.removeElementsBiggerThan = config.removeElementsBiggerThan;
		this.offset = config.offset;
		this.service = config.service;

		for (var i in widgets) {
			if (typeof widgets[i] === 'object') {
				var widget = new window[config.customWidget](console);
				widget.init(widgets[i], config, 0, null);
				widget.execute();
				this.widgets.push(widget.getWidget());
			}
		}

		this.reconfigureTopLevelElements(0);

	};

	/*
	* @returns all top level widget that have no skip flag set
	*/
	this.getNonSkippedWidgets = function()
	{
		var nonSkippedWidgets = [];

		var widgets = this.widgets;
		if (this.service === 'datapine') {
			this.widgets[0].setSkip();
			return [];
		}

		for(var i in widgets){
			if(!widgets[i].skip){
				nonSkippedWidgets.push(widgets[i]);
			}
		}

		return nonSkippedWidgets;
	}

	/*
	* creates new hierarchy of top level elements according their coordinates
	*/
	this.reconfigureTopLevelElements = function(level)
	{
		var widgets = this.getNonSkippedWidgets();

		for (var i = 0; i < widgets.length; i++) {
			for(var j = i+1; j < widgets.length; j++) {
				// if(widgets[i].skip || widgets[j].skip) continue;
				
				widget1Coordinates = widgets[i].coordinates;
				widget2Coordinates = widgets[j].coordinates;

				var percentage = this.removeElementsBiggerThan / 100;

				if(widgets[i].getArea() > this.height * this.width * percentage) {
					widgets[i].setSkip();
				}

				if(widgets[j].getArea() > this.height * this.width * percentage) {
					widgets[j].setSkip();
				}
				
				var isOverlapping = this.checkOverlap(widget1Coordinates, widget2Coordinates);

				if(isOverlapping) {
					widget1Area = widget1Coordinates.width * widget1Coordinates.height;
					widget2Area = widget2Coordinates.width * widget2Coordinates.height;
					
					if(widgets[i].getArea() > widgets[j].getArea()){
						if(!(widgets[j].parent !== null && widgets[j].parent.getArea() < widgets[i].getArea())){

							this.setProperParents(widgets[j], widgets[i], widgets);
						}
					}

					if(widget1Area < widget2Area) {
						if(!(widgets[i].parent !== null && widgets[i].parent.getArea() < widgets[j].getArea())){
						
							this.setProperParents(widgets[i], widgets[j], widgets)
						}
					}
				}
			}
		}
	}

	this.setProperParents = function(child, parent, widgets)
	{
		if(child.parent === null){

			this.removeElementFromArray(this.widgets, child);
		} else{
			this.removeElementFromArray(child.parent.subwidgets, child)
		}

		parent.addSubwidget(child);
		child.parent = parent;
		child.level = parent.level + 1;

		this.setCorrectLevelToChildren(child);

	}

	this.setCorrectLevelToChildren = function(child)
	{
		for(var i in child.subwidgets){
			child.subwidgets[i].level = child.level + 1; 
			this.setCorrectLevelToChildren(child.subwidgets[i]);
		}
	}

	this.removeElementFromArray = function(elements, element)
	{
		var index = elements.indexOf(element);
		if(index !== -1){
			elements.splice(index,1);
		}
	}

	this.checkOverlap = function(coord1, cooor2)
	{
		if(coord1 === null || cooor2 === null) {
			return false;
		}

		if(this.overlaping(coord1, cooor2)) {
			return true;
		}

		if(this.overlaping(cooor2, coord1)) {
			return true;
		}

		return false;
	}

	/*
	*checks if given coordinates overlap
	* @returns bool
	*/
	this.overlaping = function(coord1, cooor2) {
	    xOffset = coord1.x * this.offset/100;
	    yOffset = coord1.y * this.offset/100;

	    if (coord1.x <= cooor2.x
	    	&& (coord1.x + coord1.width) >= (cooor2.x + cooor2.width) 
	    	&& coord1.y <= cooor2.y 
	    	&& (coord1.y + coord1.height) >= (cooor2.y + cooor2.height) 
	    ) {
	        return true;
	    }

	    return false;
	};

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

	this.getWidgetsRelativeCoordinates = function()
	{
		var coordinates = [];

		for (var i in this.widgets) {
			coordinates.push(this.widgets[i].getRelativeCoordinatesTowardParent());
		}

		return coordinates;
	}

	/*
	* @returns string XML
	*/
	this.generateDashboardXML = function() {
		var output = "<dashboard>";
		output += "<x>"+this.marginX+"</x>";
		output += "<y>"+this.marginY+"</y>";
		output += "<width>"+this.width+"</width>";
		output += "<height>"+this.height+"</height>";

		for (var i in this.widgets) {
			if(this.useRelativeCoordinates){
				output += this.widgets[i].generateRelativeCoordinatesXML();
			} else {
				output += this.widgets[i].generateAbsoluteCoordinatesXML();	
			}
		}

		output += "</dashboard>";
		return output;
	}
}