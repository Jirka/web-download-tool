function Config(mockService, fs, console){

this.url = null; //or "" ?
this.service = null; 
this.selector = null;
this.customWidget = 'websiteWidget';
this.types = [];
this.map = {};

this.isDashboard = true;

this.windowSizeX = 1000;
this.windowSizeY = 1000;

this.configServices = "config/services.json";
this.configGeneral = "config/config.json";

this.absolutePath = "";
this.resultPath = "./result";

this.imgFormat = 'png';

this.outputPath = "output/";
this.screenPath = "./screens/";

this.timeout = 5000;

//getNext() -> transformation to fullpath+web+relativePath+.js
this.modules = [
	'modules/web/Service.js', 
	'modules/web/Widget.js',
	'modules/web/Document.js',
	'modules/web/HighChartGraphs.js',
	'modules/web/Widgets/clicdataWidget.js',	//include just one needed ____Widget.js
	'modules/web/Widgets/datapineWidget.js',
	'modules/web/Widgets/geckoboardWidget.js',
	'modules/web/Widgets/klipfolioWidget.js',
	'modules/web/Widgets/thedashWidget.js',
	'modules/web/Widgets/showcaseWidget.js',
	'modules/web/Widgets/websiteWidget.js'
];


//mock serviceName | -a serviceName ?| website | -c website element 
//should there be -c arg?  
//-s services -c general

this.parseArguments = function(args) 
{
	//just for testing
	if(args[1] === 'mock'){
		service = mockService.get(
			(args[2] !== undefined) ? args[2] : 'test', 
			(args[3] !== undefined) ? args[3] : 0 
		);
		this.url = service.url;
		this.selector = service.selector;
		this.service = service.service;
		this.customWidget = this.service + 'Widget';

		var jsonConfig= this.readConfigFiles();
		var service = this.get(jsonConfig[this.service]);
		if(service !== null){
			this.types = this.get(service.types);
			this.map = this.get(service.map);
		}
		else{
			throw "no types set for mock object";
		}

		return; 
	}

	//actual argument processing
	if(args.length === 0){
		throw "No arguments supplied";
	}

	this.url = args[1];
	if(!this.isUrlValid()){
		throw "URL adress is not valid";
	}

	this.service = this.parseUrl();
	if(args[2] !== undefined){
		this.selector = args[2];
		this.isDashboard = false; //remove this property
	}
	else{
		if(!this.isSupported()){
			this.selector = 'body'; //root
			this.isDashboard = false;
			return;
		}

		//reads config json file and sets it as properties
		var jsonConfig = this.readConfigFiles();
		//check if these properties even exist before assigning
		service = this.get(jsonConfig[this.service]);
		if(service !== null){
			this.selector = this.get(service.selector);
			this.types = this.get(service.types);
			this.map = this.get(service.map);
			this.customWidget = this.service + 'Widget';
		}
	}
}

this.get = function(value){
	return (value !== undefined) ? value : null; 
}

//split to two functions
this.readConfigFiles = function()
{
	var services = fs.read("config/services.json"); //absolute path
	var general = fs.read("config/config.json");

	return JSON.parse(services);

//put to module probably?
//var servicesConfig = JSON.parse(content);
//var currentService = servicesConfig[web.predpona];

}


this.parseUrl = function()
{
	var aElem = document.createElement('a');
	aElem.href = this.url;
	// console.log(aElem.href); //remove
	return aElem.hostname;
}

/*
* @returns bool
*/
this.isUrlValid = function()
{
	//should this be checked for null?
	var patt = /(http|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:/~+#-]*[\w@?^=%&amp;/~+#-])?/;
	var pattern = new RegExp(patt);

	if(!pattern.test(this.url)){
		return false;
	} 
	
	return true;
}


this.includes = function(elems, elem){
	var include = false;

	for(var i in elems){
		if(elems[i] === elem){
			include = true;
		}
	}

	return include;
}

this.isSupported = function()
{
	serviceSplit = this.service.split('.');
	var services = this.readConfigFiles();

	var suppoted = false;
    for(var i in services){
        if(this.includes(serviceSplit, i)){
    	   console.log('supported! service :: '+ this.service);
        	this.service = i;
    	// console.log('service :: '+ this.service);
            suppoted = true;
            break;
        }
        else{
        	// console.log('sevice not supported');
        }
    }

    return suppoted;
}

this.makeSerializable = function()	//rename probably
{
	properties = {};

	//choose this wisely, not all are needed
	//maybe group those related to service settings
	properties['url'] = this.url;	//is this needed inside website?
	properties['service'] = this.service;
	properties['selector'] = this.selector;
 	properties['types'] = this.types;
 	properties['map'] = this.map;

	properties['absolutePath'] = this.absolutePath;
 	properties['imgFormat'] = this.imgFormat;
 	properties['maxLevel'] = 1; //from config
 	properties['customWidget'] = this.customWidget;
 	properties['width'] = this.windowSizeX;
 	properties['height'] = this.windowSizeY;

 	return properties;
}

}

exports.create = function(mockService, fs, console){
    return new Config(mockService, fs, console);
};