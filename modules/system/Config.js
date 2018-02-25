function Config(mockService, fs, console)
{
	this.url = null; //or "" ?
	this.service = null; 
	this.selector = 'body'; //root
	this.customWidget = 'websiteWidget';
	this.types = [];
	this.map = {};

	this.width = 1000;
	this.height = 1000;

	this.configServices = "config/services.json";

	this.resultPath = "./result";
	this.screenPath = "screens/";
	this.fileName = null;

	this.imageFormat = 'png';

	this.timeout = 5000;
	this.maxHierarchyLevel = 1;

	this.generateWidetScreenshots = false;
	this.treatAsWebsite = false;

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

	this.parseArguments = function(args) 
	{
		if(args.length === 0){
			throw "No arguments supplied"; //add hint
		}

		//find custom config file if exists
		var customConfigPath = null;
		for (var i = 0; i < args.length; i++) {
			if(args[i] === '-c') {
				var path = args[i+1];
				customConfigPath = (path !== undefined) ? path : null;
			}
		}

		//read config files
		var services = this.readAndParseFile(this.configServices);
		var configuration = this.readAndParseFile(customConfigPath);

		if (args[1] === 'mock') {
			//just for testing purposes
			this.url = mockService.get(
				(args[2] !== undefined) ? args[2] : 'test', 
				(args[3] !== undefined) ? args[3] : 0
			);
		} else {
			this.url = args[1];
		}

		if(!this.isUrlValid()){
			throw "URL adress is not valid"; //add format example
		}

		this.service = this.parseUrl();
		if (!this.isSupported(services)) { return; }

		//overrides less important settings
		mergedConfiguration = (services[this.service] !== null) ? services[this.service] : {};  
		for(var i in configuration) {
			if(configuration[i] !== null){
				mergedConfiguration[i] = configuration[i];
			}
		}

		this.setProperties(mergedConfiguration);
	}

	this.setProperties = function(configuration)
	{
		//validate data types

		if(configuration === null){
			return;
		}

		for (var i in configuration) {
			this[i] = configuration[i];
		}

		this.customWidget = this.service + 'Widget';
	}

	this.get = function(value)
	{
		return (value !== undefined) ? value : null; 
	}

	/*
	* @returns null|string file content
	*/
	this.readAndParseFile = function(path)
	{
		if(path === null) {
			return null;
		}

		if(!fs.exists(path)) {
			throw "Given file doesnt exist"; //specify which
		}

		try{
			result = JSON.parse(fs.read(path))
		} catch(e) {
			throw 'Problem with parsing json file';
		}

		return result;
	}


	/*
	*@returns string url hostname 
	*/
	this.parseUrl = function()
	{
		var element = document.createElement('a');
		element.href = this.url;

		return element.hostname;
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

	/*
	* @returns bool
	*/
	this.isSupported = function(services)
	{
		serviceSplit = this.service.split('.');
		console.log(services);

		var suppoted = false;
	    for(var i in services){
	        if(this.includes(serviceSplit, i)){
	    	   console.log('supported! service :: '+ this.service);
	        	this.service = i;
	            suppoted = true;
	            break;
	        }
	    }

	    return suppoted;
	}

	/*
	* @returns string path to image saving
	*/
	this.getResultImagePath = function(level)
	{
		var fileName = (this.fileName === null || this.fileName === '') ?  this.service : this.fileName;
		var level = (level === null) ? '' : this.screenPath + level + '_';

		return this.resultPath + '/' + level + fileName + '.' + this.imageFormat;
	}

	/*
	* @returns string path to xml saving
	*/
	this.getResultXmlPath = function()
	{
		var fileName = (this.fileName === null || this.fileName === '') ?  this.service : this.fileName;

		return this.resultPath + '/' + fileName + '.xml';
	}

	this.makeSerializable = function()
	{
		properties = {};

		properties['url'] = this.url;	//is this needed inside website?
		properties['service'] = this.service;
		properties['selector'] = this.selector;
	 	properties['types'] = this.types;
	 	properties['map'] = this.map;

	 	properties['width'] = this.with;
	 	properties['height'] = this.height;
	 	properties['imageFormat'] = this.imageFormat;
	 	properties['customWidget'] = this.customWidget;
	 	properties['maxHierarchyLevel'] = this.maxHierarchyLevel;
	 	properties['generateWidetScreenshots'] = this.generateWidetScreenshots;
	 	properties['treatAsWebsite'] = this.treatAsWebsite; //need to export?

	 	return properties;
	}

	/*
	* for debug purposes only
	*/
	this.print = function()
	{
		console.log('-----------------CONFIG START--------------------');
		console.log('url:::'+this.url);
		console.log('service:::'+this.service);
		console.log('selector::'+this.selector);
		console.log('imageFormat::'+this.imageFormat);
		console.log('width::'+this.width);
		console.log('height::'+this.height);
		console.log('maxHierarchyLevel::'+this.maxHierarchyLevel);
		console.log('treatAsWebsite::'+this.treatAsWebsite);
		console.log('generateWidetScreenshots::'+this.generateWidetScreenshots);
		console.log('resultPath::'+this.resultPath);
		console.log('fileName::'+this.fileName);
		console.log('screenPath::'+this.screenPath);

		console.log('-----------------CONFIG END--------------------');
	}

}

exports.create = function(mockService, fs, console){
    return new Config(mockService, fs, console);
};