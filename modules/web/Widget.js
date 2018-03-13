function Widget(console) {
	
	this.type = 'CHART';
	this.html = null;
	this.json = null; //only selected services
	this.coordinates = null;
	this.supportedTypes = [];
	this.maxLevel = 1;
	this.config = null; 
	this.exernalService = null;

	this.level = 0;	//actual level in hierarchy 
	this.skip = false;

	this.subwidgets = []; //[self]

	this.init = function(html, config, level)
	{
		this.html = html;
		this.supportedTypes = config.types; 
		this.level = level;
		this.maxLevel = config.maxHierarchyLevel;
		this.config = config;
	}

	/*
	* 
	*/
	this.setCoordinates = function()
	{
		var coordinates = {'x' : 0, 'y' : 0, 'left' : 0, 'top' : 0};

		if (this.html !== null) {
			var coordinates = this.html.getBoundingClientRect();
		}
		
		this.coordinates = this.transform(coordinates);

		//setting margin from configuration
		this.coordinates['xx'] = this.coordinates['x'] - this.config.marginX;
		this.coordinates['yy'] = this.coordinates['y'] - this.config.marginY;

		if (this.coordinates.width <= 0 || this.coordinates.height <= 0 || this.coordinates.x <= 0 || this.coordinates.y <= 0) {
			this.skip = true;
		}
	}

	this.setType = function(type) 
	{
		this.type = this.translateType(type);
	};

	this.setSubwidgets = function(subwidgets) 
	{
		this.subwidgets = subwidgets;
		this.removeSameSubwidgets();		
	}
	
	/*
	* @returns object of coordinates of widget and subwidgets
	*/
	this.getCoordinates = function()
	{
		var groupCoordinates = {'widget' : null, 'subCoord' : []};

		if (!this.skip) {
			groupCoordinates['coord'] = this.coordinates;
		}

		for (var i in this.subwidgets) {
			var subCoordinates = this.subwidgets[i].getCoordinates();
			groupCoordinates['subCoord'].push(subCoordinates);
		}

		return groupCoordinates;
	}

	/*
	* picks needed properties of DOM object and transforms them into proper naming
	*/
	this.transform = function(coordinates)
	{
		var mapping = {'left' : 'x', 'top' : 'y', 'width' : 'width', 'height' : 'height'};
		var result = {};

		for (var i in mapping) {
			result[mapping[i]] = Math.round(coordinates[i]);
		}

		return result;
	};
	
	/*
	*
	*/
	this.subtractCoordinates = function(minX, minY)
	{
		this.coordinates.x = this.coordinates.x - minX;
		this.coordinates.y = this.coordinates.y - minY;

		for (var i in this.subwidgets) {
			this.subwidgets[i].subtractCoordinates(minX, minY);
		}
	}

	/*
	* translates type gotten from website to mapping from configuration 
	* if mapping is not found original type is returned
	* @returns string type
	*/
	this.translateType = function(type)
	{
		for (var i in this.config.map) {
			if (i == type) {
				return this.config.map[i];
			}
		}

		return type;
	}

	/*
	* skips widget in case of two widgets in hierarchy have the same size
	*/
	this.removeSameSubwidgets = function()
	{
		for (var i in this.subwidgets) {
			if (
				this.coordinates.x === this.subwidgets[i].coordinates.x
				&& this.coordinates.y === this.subwidgets[i].coordinates.y
				&& this.coordinates.width === this.subwidgets[i].coordinates.width
				&& this.coordinates.height === this.subwidgets[i].coordinates.height
			) {
				this.subwidgets[i].skip = true;
			}
		}
	}

	/*
	* @returns string 
	*/
	this.generateXML = function()
	{
		console.log('generating xml')
		var output = '';

		if (!this.skip) {
			output +=  '<graphicalElement>';
			output += "<x>" + this.coordinates.xx + '</x>';
			output += "<y>" + this.coordinates.yy + '</y>';		
			output += "<width>" + this.coordinates.width + '</width>';		
			output += "<height>" + this.coordinates.height + '</height>';
			output += "<type>" + this.type + "</type>";
		}	

			for (var i in this.subwidgets) {
				output += this.subwidgets[i].generateXML();
			}

		if (!this.skip) {
			output += '</graphicalElement>';
		}

		return output;
	}
}