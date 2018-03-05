function Widget(console) {
	
	this.type = 'CHART';
	this.html = null;
	this.json = null; //only selected services
	this.coordinates = null;
	this.supportedTypes = [];
	this.maxLevel = 2;
	this.config = null; 
	this.exernalService = null;

	this.level = 0;	//actual level in hierarchy 
	this.skip = false;

	this.subwidgets = []; //[self]

	//array of elements included in xml output, for website it will exclude type

	//put this logic to widgetfactory
								//pass just one value, if not more needed
	this.init = function(html, config, level)
	{
		this.html = html;
		this.supportedTypes = config.types; 
		this.level = level;
		// this.maxLevel = config.maxLevel;
		this.config = config;
	}

	this.setCoordinates = function()
	{
		var coordinates = {'x' : 0, 'y' : 0, 'left' : 0, 'top' : 0};

		if (this.html !== null) {
			var coordinates = this.html.getBoundingClientRect();
		}
		
		//should this translate method be in Document? maybe somthing like private in here, if it is not used by anyone else
		this.coordinates = this.transform(coordinates);

		
		//should it be here?
		if (this.coordinates.width === 0 || this.coordinates.height === 0) {
			this.skip = true;
		}
	}

	this.transform = function(coordinates)
	{
		var mapping = {'left' : 'x', 'top' : 'y', 'width' : 'width', 'height' : 'height'};
		var result = {};

		for (var i in mapping) {
			result[mapping[i]] = Math.round(coordinates[i]);
		}

		//setting margin from configuration
		result['x'] -= this.config.marginX;
		result['y'] -= this.config.marginY;

		return result;
	};
	
	this.subtractCoordinates = function(minX, minY)
	{
		this.coordinates.x = this.coordinates.x - minX;
		this.coordinates.y = this.coordinates.y - minY;

		for (var i in this.subwidgets) {
			this.subwidgets[i].subtractCoordinates(minX, minY);
		}
	}

	this.setType = function(type) 
	{
		this.type = this.translateType(type);
	};

	//if mapping is not found original type is returned 
	this.translateType = function(type)
	{
		for (var i in this.config.map) {
			if (i == type) {
				return this.config.map[i];
			}
		}

		return type;
	}

	this.setSubwidgets = function(subwidgets) 
	{
		this.subwidgets = subwidgets;
		this.removeSameSubwidgets();		
	}

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

	this.getCoordinates = function()
	{
		var groupCoordinates = {'coord' : null, 'subCoord' : []};

		if (!this.skip) {
			groupCoordinates['coord'] = this.coordinates;
		}

		for (var i in this.subwidgets) {
			var subCoord = this.subwidgets[i].getCoordinates();
			groupCoordinates['subCoord'].push(subCoord);
		}

		return groupCoordinates;
	}

	/*
	* @returns string 
	*/
	this.generateXML = function()
	{
		var output = '';

		if (!this.skip) {
			output +=  '<graphicalElement>';
			output += "<x>" + this.coordinates.x + '</x>';
			output += "<y>" + this.coordinates.y + '</y>';		
			output += "<width>" + this.coordinates.width + '</width>';		
			output += "<height>" + this.coordinates.height + '</height>';
			output += "<type>" + this.type + "</type>";
		}	

			//missing type - is it always gonna be here? even when raw web

			// console.log("num of subwidgets" + this.subwidgets.length );
			for (var i in this.subwidgets) {
				output += this.subwidgets[i].generateXML();
			}

		if (!this.skip) {
			output += '</graphicalElement>';
		}

		return output;
	}
}