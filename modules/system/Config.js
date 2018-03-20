function Config(fs, console)
{
	this.properties = [
		'c',
		'height',
		'width',
		'url',
		'service',
		'selector',
		'customWidget',
		'types',
		'map',
		'filename',
		'marginX',
		'marginY',
		'resultPath',
		'screenPath',
		'fileName',
		'imageFormat',
		'timeout',
		'maxHierarchyLevel',
		'generateWidetScreenshots',
		'treatAsWebsite',
		'imageQuality',
		'configServices',
		'isServiceSupported',
		'wrap'
	];

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

	this.resultPath = "result";
	this.screenPath = "screens/";
	this.fileName = null;

	this.imageFormat = 'png';

	this.timeout = 5000;
	this.maxHierarchyLevel = 1;

	this.generateWidetScreenshots = false;
	this.treatAsWebsite = false;

	this.imageQuality = 100; 

	//down protected values
	this.configServices = "config/services.json";

	this.isServiceSupported = false;
	this.wrap = false;
	this.onlyScreen = false;

	this.violations = {};

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

	this.setup = function(args) 
	{
		//get configuration from all sources
		var cliConfiguration = this.parseArgumentsFromCLI(args);
		var jsonConfiguration = this.readAndParseFile(cliConfiguration['c']);
		var servicesConfiguration = this.readAndParseFile(this.configServices);

		var mergedCliAndJsonConfig = this.mergeAndValidateConfiguration(cliConfiguration, jsonConfiguration);
		if(mergedCliAndJsonConfig['url'] === undefined){
			throw 'URL is required parameter';
		}

		this.service = this.parseUrl(mergedCliAndJsonConfig['url']);
		this.isServiceSupported = this.isSupported(servicesConfiguration);
		var serviceConfiguration = (servicesConfiguration[this.service] !== undefined) ? servicesConfiguration[this.service] : {};

		var mergedConfiguration = this.mergeAndValidateConfiguration(mergedCliAndJsonConfig, serviceConfiguration); 

		this.setProperties(mergedConfiguration);
	}

	/*
	* merges two configuration object
	* arugment priority config overwites additionalConfig argument
	*/
	this.mergeAndValidateConfiguration = function(priorityConfig, additionalConfig)
	{
		priorityConfig = this.validateProperties(priorityConfig);
		additionalConfig = this.validateProperties(additionalConfig);

		mergedConfig = additionalConfig;

		for (var i in priorityConfig) {
			mergedConfig[i] = priorityConfig[i];
		}

		// this.processViolations();

		return mergedConfig;
	}

	/*
	* @throws Exception
	* @retuns object
	*/
	this.parseArgumentsFromCLI = function(args)
	{
		console.log(args.length);
		if (args.length === 0) {
			throw "No arguments supplied"; //add hint
		}

		parsedArguments = {
			'c' : null
		};

		for (var i = 0; i < args.length; i++) {
			var propertyName = this.getPropertyName(args[i]);
			if (propertyName !== null){
				var value = args[i+1];
				parsedArguments[propertyName] = this.getValue(value);
			}
		}

		return parsedArguments;
	}

	/*
	* @returns null|string property name
	*/
	this.getPropertyName = function(property)
	{
		var propertyName = null;

		for(var i in this.properties) {
			if ('-' + this.properties[i] === property || ('--' + this.properties[i]) === property) {
				propertyName = this.properties[i];
				break;
			}
		}

		return propertyName;
	}

	/*
	* @returns bool
	*/
	this.validProperty = function(key, value)
	{
		var isValid = (value !== null); // || undefined ?

		switch(key) {
			case 'height':
			case 'width' :
				isValid = (value !== 0 && !isNaN(value));
				break;
			case 'url':
				isValid = this.isUrlValid(value);
				break;
			case 'service':
			case 'selector':
			case 'customWidget':
			case 'types':
			case 'map':
			case 'filename ':
			case 'marginX':
			case 'marginY':
			case 'resultPath':
			case 'screenPath':
			case 'fileName':
			case 'imageFormat':
			case 'timeout':
			case 'maxHierarchyLevel':
			case 'generateWidetScreenshots':
			case 'treatAsWebsite':
			case 'imageQuality':
			case 'configServices':
			case 'isServiceSupported':
			case 'wrap':
			case 'onlyScreen':
				break;
			//protected values -> cannot be overwritten
			case 'isServiceSupported':
			case 'configServices':
			case 'modules':
			case 'violations':
				isValid = false;
			default:
				isValid = false;
				break;
		}

		if (!isValid) {
			this.violations[key] = key + ' not valid';
		}

		return isValid;
	}

	this.validateProperties = function(properties)
	{
		var passed = {};

		for(var i in properties) {
			if(this.validProperty(i, properties[i])) {
				passed[i] = properties[i];
			}
		}

		return passed;
	}

	this.setProperties = function(configuration)
	{
		if (configuration === null) {
			return;
		}

		for (var i in configuration) {
			this[i] = configuration[i];
		}

		if (this.isServiceSupported && !this.treatAsWebsite) {
			this.customWidget = this.service + 'Widget';
		}
	}

	this.getValue = function(value)
	{
		return (value !== undefined) ? value : null; 
	}

	/*
	* @returns null|object with parsed JSON
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
	this.parseUrl = function(url)
	{
		var element = document.createElement('a');
		element.href = url;

		return element.hostname;
	}

	/*
	* @returns bool
	*/
	this.isUrlValid = function(url)
	{
		//should this be checked for null?
		var patt = /(http|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:/~+#-]*[\w@?^=%&amp;/~+#-])?/;
		var pattern = new RegExp(patt);

		if (!pattern.test(url)) {
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
		// console.log(services);

		var suppoted = false;
	    for (var i in services) {
	        if (this.includes(serviceSplit, i)) {
	    	   console.log('supported service :: '+ this.service);
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
	 	properties['onlyScreen'] = this.onlyScreen;

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
		console.log('timeout::'+this.timeout);
		console.log('maxHierarchyLevel::'+this.maxHierarchyLevel);
		console.log('treatAsWebsite::'+this.treatAsWebsite);
		console.log('generateWidetScreenshots::'+this.generateWidetScreenshots);
		console.log('resultPath::'+this.resultPath);
		console.log('fileName::'+this.fileName);
		console.log('screenPath::'+this.screenPath);
		console.log('marginX::'+this.marginX);
		console.log('marginY::'+this.marginY);
		console.log('customWidget::' + this.customWidget);
		console.log('wrap::' + this.wrap);
		console.log('onlyScreen::' + this.onlyScreen);
		console.log('absoluteResultPath::' + fs.workingDirectory + '/' + this.resultPath );
		console.log('-----------------CONFIG END--------------------');
	}

}

exports.create = function(fs, console) {
    return new Config(fs, console);
};