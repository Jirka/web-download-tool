function Widget(console) {
	
	this.type = 'CHART';
	this.html = null;
	this.json = null; //only selected services
	this.coordinates = null;
	this.supportedTypes = [];
	this.maxLevel = 1;
	this.config = null; 
	this.exernalService = null;
	this.parent = null;

	this.level = 0;	//actual level in hierarchy 
	this.skip = false;

	this.subwidgets = []; //[self]

	this.init = function(html, config, level, parent)
	{
		this.html = html;
		this.supportedTypes = config.types; 
		this.level = level;
		this.maxLevel = config.maximumHierarchyLevel;
		this.parent = parent;
		this.config = config;
		this.css = {};
	}

	/*
	* @throws Exception
	*/
	this.setCoordinates = function()
	{
		var coordinates = {'x' : 0, 'y' : 0, 'height' : 0, 'width' : 0};


		if(this.html === null) {
			throw new "ERROR no html found";
		}

		if (this.html !== null) {
			var coordinates = this.html.getBoundingClientRect();
		}
		
		this.coordinates = this.transform(coordinates);

		//setting margin from configuration
		this.coordinates['xx'] = this.coordinates['x'] - this.config.marginX;
		this.coordinates['yy'] = this.coordinates['y'] - this.config.marginY;

		this.checkCoordinates(coordinates);
	}

	/*
	* sets skip property in case element is invisible or takes space of whole website
	*/
	this.checkCoordinates = function(coordinates)
	{
		if (this.coordinates.width <= 0 
			|| this.coordinates.height <= 0 
			|| this.coordinates.x < 0 
			|| this.coordinates.y < 0
			|| (this.config.width <= coordinates.width && this.config.height <= coordinates.height)  
		) {
			this.setSkip();
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

	this.addSubwidget = function(subwidget)
	{
		this.subwidgets.push(subwidget);
	}

	this.getArea = function()
	{
		if(this.coordinates !== null){
			return this.coordinates.width * this.coordinates.height;
		}

		return 0;
	}

	this.setSkip = function()
	{
		this.skip = true;

		for(var i in this.subwidgets) {
			this.subwidgets[i].level = this.level;
		}
	}

	/*
	* @returns object of coordinates of widget and subwidgets
	*/
	this.getCoordinates = function()
	{
		var groupCoordinates = {'coord' : null, 'subCoord' : []};

		if (!this.skip) {
			groupCoordinates['coord'] = this.coordinates;
		}

		for (var i in this.subwidgets) {
			var subCoordinates = this.subwidgets[i].getCoordinates();
			groupCoordinates['subCoord'].push(subCoordinates);
		}

		return groupCoordinates;
	}

	this.getPreviousVisibleParent = function(parent)
	{
		if(parent === null) {
			return null;
		}

		if(parent !== null && parent.skip){
			return this.getPreviousVisibleParent(parent.parent);
		}

		return parent;
	}

	this.getRelativeCoordinatesTowardParent = function()
	{
		var groupCoordinates = {'coord' : null, 'subCoord' : []};

		if (!this.skip) {
			var parent = this.parent;
			if(this.parent !== null && this.parent.skip){
				parent = this.getPreviousVisibleParent(this.parent);
			}

			if(this.parent !== null && parent !== null && this.parent.coordinates !== null){
				groupCoordinates['coord'] = {
					'x' : Math.abs(this.parent.coordinates.x - this.coordinates.x), 
					'y' : Math.abs(this.parent.coordinates.y - this.coordinates.y),
					'xx' : Math.abs(this.parent.coordinates.xx - this.coordinates.xx),
					'yy' : Math.abs(this.parent.coordinates.yy - this.coordinates.yy),
					'width' : this.coordinates.width, 
					'height' : this.coordinates.height
				};
			}
			else {
				groupCoordinates['coord'] = this.coordinates;
			}
		}

		for (var i in this.subwidgets) {
			var subCoordinates = this.subwidgets[i].getRelativeCoordinatesTowardParent();
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
			if (this.coordinates.x === this.subwidgets[i].coordinates.x
				&& this.coordinates.y === this.subwidgets[i].coordinates.y
				&& this.coordinates.width === this.subwidgets[i].coordinates.width
				&& this.coordinates.height === this.subwidgets[i].coordinates.height
			) {
				this.subwidgets[i].setSkip();
			}
		}
	}

	this.getCssProperties = function()
	{
		if(this.html === null || this.skip) {
			return;
		}

		style = getComputedStyle(this.html, null);
		parsedStyle = cssBgParser.parseElementStyle(style);
		
		for(var i in style) {
			if(style[i] !== '' && typeof style[i] !== 'function'){
				
				switch(i) {
					case 'background-color':
					case 'background':
						if(parsedStyle.backgrounds.length > 0) {
							this.css['background-color'] = parsedStyle.backgrounds[0].color;
						}
						break;
				    case 'background-image':
				    case 'background-position':
				    case 'background-size':
				    case 'background-repeat':
				    case 'background-origin':
				    case 'background-clip':
				    case 'background-attachment':
						break;
					case 'color':
						break;
					case 'visibility':
						this.skip = (style[i] === 'hidden') ? true : this.skip;
						break;
					case 'display':
						this.skip = (style[i] === 'none') ? true : this.skip;
						break;
					default:
						break;
				}
			}
		}
	}

	/*
	* @returns string XML
	*/
	this.generateXML = function(coordinates)
	{
		var output = '';

		if(this.level >= this.maxLevel) return '';

		if (!this.skip) {
			output +=  '<graphicalElement>';
			output += "<x>" + coordinates.xx + '</x>';
			output += "<y>" + coordinates.yy + '</y>';		
			output += "<width>" + coordinates.width + '</width>';		
			output += "<height>" + coordinates.height + '</height>';
			if(this.config.showCssProperties && this.css['background-color'] !== undefined){
			 	output += '<background-color>' + this.css['background-color'] + '</background-color>';
			}
			output += "<type>" + this.type + "</type>";
		}	

			for (var i in this.subwidgets) {
				output += this.subwidgets[i].generateSubwidgetXML();
			}

		if (!this.skip) {
			output += '</graphicalElement>';
		}

		return output;
	}

	/*
	* @returns string
	*/
	this.generateSubwidgetXML = function()
	{
		if(this.config.useRelativeCoordinates) {
			return this.generateRelativeCoordinatesXML();
		}
		else {
			return this.generateAbsoluteCoordinatesXML();
		}
	}

	/*
	* @returns string
	*/
	this.generateAbsoluteCoordinatesXML = function()
	{
		return this.generateXML(this.coordinates);
	}

	/*
	* @returns string
	*/
	this.generateRelativeCoordinatesXML = function()
	{

		var coordinates = this.getRelativeCoordinatesTowardParent();

		return this.generateXML(coordinates['coord']);
	}
}