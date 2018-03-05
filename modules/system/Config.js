function Config(fs, console)
{
	this.url = null;
	this.service = null; 
	this.selector = 'body'; //root
	this.customWidget = 'websiteWidget';
	this.types = [];
	this.map = {};

	this.width = 1000;
	this.height = 1000;

	this.marginX = 0;
	this.marginY = 0;

	this.resultPath = "./result";
	this.screenPath = "screens/";
	this.fileName = null;

	this.imageFormat = 'png';

	this.timeout = 5000;
	this.maxHierarchyLevel = 1;

	this.generateWidetScreenshots = false;
	this.treatAsWebsite = false;

	this.imageQuality = 100; 

	//down protected values
	this.configServices = "config/services.json"; //??

	this.isServiceSupported = false;
	this.wrap = false;

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
		if (args.length === 0) {
			throw "No arguments supplied"; //add hint
		}

		//find custom config file if exists
		var customConfigPath = null;
		for (var i = 0; i < args.length; i++) {
			if (args[i] === '-c') {
				var path = args[i+1];
				customConfigPath = (path !== undefined) ? path : null;
			}
		}

		//read config files
		var services = this.readAndParseFile(this.configServices);
		var configuration = this.readAndParseFile(customConfigPath);

		this.url = (configuration !== null && configuration['url'] !== undefined) ? configuration['url'] : args[1];
		if (!this.isUrlValid()) {
			throw "URL adress is not valid"; //add format example
		}

		this.service = this.parseUrl();

		this.isServiceSupported = this.isSupported(services);

		//override less important settings
		mergedConfiguration = (services[this.service] !== undefined) ? services[this.service] : {};
		for (var i in configuration) {
			//temporary solution for script generator - FIX
			if ((i === "height" && configuration[i] === 0)
				||  
				(i === "width" && configuration[i] === 0)
			) {
				console.log('skipped');
				continue;
			}

			if (configuration[i] !== null) {
				mergedConfiguration[i] = configuration[i];
			}
		}

		
		this.setProperties(mergedConfiguration);
	}

	this.setProperties = function(configuration)
	{
		//validate data types

		if (configuration === null) {
			return;
		}

		for (var i in configuration) {
			this[i] = configuration[i];
		}

		if (this.isServiceSupported) {
			this.customWidget = this.service + 'Widget';
		}
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
		if (path === null) {
			return null;
		}

		if (!fs.exists(path)) {
			throw "Given file doesnt exist " + path; //specify which
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

		if (!pattern.test(this.url)) {
			return false;
		} 
		
		return true;
	}

	/*
	* @returns bool
	*/
	this.includes = function(elems, elem)
	{
		var include = false;

		for (var i in elems) {
			if (elems[i] === elem) {
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
	    for (var i in services) {
	        if (this.includes(serviceSplit, i)) {
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

	/*
	* @returns array of properties
	*/
	this.makeSerializable = function()
	{
		properties = {};

		properties['url'] = this.url;	//is this needed inside website?
		properties['service'] = this.service;
		properties['selector'] = this.selector;
	 	properties['types'] = this.types;
	 	properties['map'] = this.map;

	 	properties['width'] = this.width;
	 	properties['height'] = this.height;
	 	properties['imageFormat'] = this.imageFormat;
	 	properties['customWidget'] = this.customWidget;
	 	properties['maxHierarchyLevel'] = this.maxHierarchyLevel;
	 	properties['generateWidetScreenshots'] = this.generateWidetScreenshots;
	 	properties['treatAsWebsite'] = this.treatAsWebsite; //need to export?
	 	properties['marginX'] = this.marginX;
	 	properties['marginY'] = this.marginY;
	 	properties['wrap'] = this.wrap;

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
		console.log('marginX::'+this.marginX);
		console.log('marginY::'+this.marginY);
		console.log('customWidget' + this.customWidget);
		console.log('wrap' + this.wrap);

		console.log('-----------------CONFIG END--------------------');
	}

}

exports.create = function(fs, console) {
    return new Config(fs, console);
};