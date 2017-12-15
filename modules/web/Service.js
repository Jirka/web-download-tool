function Service( console) {
	//reference to top level widgets
	this.widgets = [];


	this.width = 0;
	this.height = 0;

	//could have flag for whether its going to be hierarchy or just one 
	
	/*
	* 
	*/ //maybe rename
	this.execute = function(config){

		var dDocument = new Document(document);
		var widgets = dDocument.findWidgets(config.selector);

		this.width = config.width;
		this.height = config.height; 
		
		//just for debug
		console.log("selector::"+config.selector);
		console.log('name::'+config.service);
		console.log('types::'+config.types)
		console.log('widgets count::'+widgets.length);

		for(var i in widgets){
			if(typeof widgets[i] === 'object'){	//try better check, for e.g. is instaceof html elem ,... 
				var widget = new window[config.customWidget](console);
				widget.init(widgets[i], config, 0);
				widget.execute();
				this.widgets.push(widget.getWidget());

			}
		}
	};

	this.generateDashboardXML = function(){
		var output = "<dashboard>";
		output += "<x>0</x>";
		output += "<y>0</y>";
		output += "<width>"+this.width+"</width>";
		output += "<height>"+this.height+"</height>";

		for(var i in this.widgets){
			output += this.widgets[i].generateXML();
		}

		output += "</dashboard>";
		return output;
	}


	this.getWidgetsCoordinates = function()
	{
		//split to two function getTopLevelWidgetsCoord & getSubWidgetsCoord
		var coord = [];

		for(var i in this.widgets){
			coord.push(this.widgets[i].getCoordinates());
		}

		return coord;
	}


}