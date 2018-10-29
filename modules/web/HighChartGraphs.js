function HighChartGraphs(console) {
	this.charts = {};
	this.ids = [];

	this.init = function(highcharts, object) {
		if (highcharts === undefined) {
			return;
		}

		doc = new Document(document, console);
		
		for (var i in highcharts.charts) {
			var result = false;
			var id = null;

			//warning : can be undefined fiels of array
			if (highcharts.charts[i].options.chart.renderTo !== undefined) {
	            id = highcharts.charts[i].options.chart.renderTo;
	            result = doc.findIdOnLowerLevelS(id, object);
	        }
	        else{
	        	id = highcharts.charts[i].container.id;  //simplify highcharts.charts			
	            result = doc.findIdOnLowerLevelS(id, object);
	        }

			if (result !== false) {
	            this.ids.push(id);
	            this.charts[id] = {'options' : highcharts.charts[i].options, 'obj' : result};
	        }

	        //if there are more then two widgets inside, do subwidgets
		}		
	};

	/*
	*returns bool
	*/
	this.hasSubwidgets = function()
	{
		return (this.ids.length > 1) ? true : false;
	}

	/*
	* returns Highchart object|null
	*/
	this.getChart = function(id) {
		return (this.charts[id] !== undefined) ? this.charts[id] : null;
	}


	this.exists = function(id)
	{
		return (this.charts[id] !== undefined) ? true : false;	
	}

	this.getProperty = function(property) {

		var result = null;

		try{

			switch(property) {
				case 'type':
					var type = this.getType();
					return type;
					break;
			}
		}
		catch(e) {
			console.log('property doesnt exist');
		}

		return result;

		//API documentation: https://api.highcharts.com/highcharts/title
	}

	this.getType = function()
	{
		doc = new Document();

		var result = [];
		var types = {};

		for (var i in this.ids) {
			
			var o = this.charts[this.ids].options;
			
			if (o.chart.type !== undefined) {

				types[o.chart.type] = null;	
			}

			for (var j in o.series) {
				if (o.series[j].type !== undefined) {
					types[o.series[j].type] = null;
				}
			}

			types = Object.keys(types);
			if (types.length === 1) {
				result.push(Object.keys(types)[0]);
			}
			else{
				var supportedCombinations = [['line','column'],[]]; //as property
				
				//separate function
				for (var k in supportedCombinations) {
					var pass = true;
					var tmpName = '';
					for (var j in types) {
						tmpName += types[j] + '_';
						if (doc.includes(supportedCombinations[k], types[j]) === false) {
							pass = false;
							break;
						}
					}

					if (pass) {
						result.push(tmpName);
						break;
					}
					else{
						result.push('mixed');
					}

				}

				//split types of element on page to categories according to prioriries = chart = high, text = low
			}
		}

		var obj = {};
		for (var i in result) {
			obj[result[i]] = null;
		}

		if (Object.keys(obj).length === 1) {
			return result[0]
		}

		if (result.length === 0) {
			return null;
		}

		return result;

	}				
}