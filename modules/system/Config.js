function Config(fs, console)
{
	this.properties = [
		'c',
		'height',
		'width',
		'url',
		'selector',
		'types',
		'map',
		'fileName',
		'marginX',
		'marginY',
		'resultPath',
		'screenPath',
		'imageFormat',
		'timeout',
		'maximumHierarchyLevel',
		'generateWidgetScreenshots',
		'treatAsWebsite',
		'imageQuality',
		'wrap',
		'widgetClasses',
		'hasHighcharts',
		'useRelativeCoordinates',
		'onlyScreen',
		'showCssProperties',
		'removeElementsBiggerThan',
		'offset'
	];

	this.booleanValues = [
		'generateWidgetScreenshots',
		'treatAsWebsite',
		'onlyScreen',
		'wrap',
		'useRelativeCoordinates',
		'hasHighcharts',
		'showCssProperties'
	]

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
	this.maximumHierarchyLevel = 1;
	this.removeElementsBiggerThan = 101;
	this.offset = 0;

	this.useRelativeCoordinates = false;
	this.showCssProperties = false;

	this.generateWidgetScreenshots = false;
	this.treatAsWebsite = false;

	this.imageQuality = 100; 
	this.onlyScreen = false;

	//-------protected values-------
	this.configServices = "config/services.json";

	this.isServiceSupported = false;

	this.violations = {};

	this.modules = [
		'modules/web/Service.js', 
		'modules/web/Widget.js',
		'modules/web/Document.js',
		'modules/web/HighChartGraphs.js',
		'modules/web/Widgets/clicdataWidget.js',
		'modules/web/Widgets/datapineWidget.js',
		'modules/web/Widgets/geckoboardWidget.js',
		'modules/web/Widgets/klipfolioWidget.js',
		'modules/web/Widgets/thedashWidget.js',
		'modules/web/Widgets/showcaseWidget.js',
		'modules/web/Widgets/websiteWidget.js',
		'external/node_modules/css-background-parser/index.js'
	];

	/*
	*loads and validates configuration sources
	*validated values are set as properties according their priority
	*/
	this.setup = function(args) 
	{
		//get configuration from all sources
		var cliConfiguration = this.parseArgumentsFromCLI(args);
		var jsonConfiguration = this.readAndParseFile(cliConfiguration['c']);
		var servicesConfiguration = this.readAndParseFile(this.configServices);

		jsonConfiguration = (jsonConfiguration !== null) ? jsonConfiguration : {};

		this.validateConfigurations({
			'cli' : cliConfiguration,
			'file' : jsonConfiguration,
		});


		var mergedCliAndJsonConfig = this.mergeConfigurations(cliConfiguration, jsonConfiguration);
		if(mergedCliAndJsonConfig['url'] === undefined){
			throw 'URL is required parameter';
		}

		this.service = this.parseUrl(mergedCliAndJsonConfig['url']);
		this.isServiceSupported = this.isSupported(servicesConfiguration);
		var serviceConfiguration = (servicesConfiguration[this.service] !== undefined) ? servicesConfiguration[this.service] : {};
		this.validateConfigurations({'service' : serviceConfiguration});

		var mergedConfiguration = this.mergeConfigurations(mergedCliAndJsonConfig, serviceConfiguration); 

		this.setProperties(mergedConfiguration);
	}


	/*
	* @throws Exception
	* @retuns object
	*/
	this.parseArgumentsFromCLI = function(args)
	{
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

		if(propertyName === null && property[0] === '-') {
			this.violations['cli'] = [property + ' is not supported'];
		}

		return propertyName;
	}

	/*
	* merges two configuration objects
	* arugment priority config overwrites additionalConfig argument
	*/
	this.mergeConfigurations = function(priorityConfig, additionalConfig)
	{
		mergedConfig = additionalConfig;

		for (var i in priorityConfig) {
			mergedConfig[i] = priorityConfig[i];
		}

		return mergedConfig;
	}


	/**
	* @throws exception
	*/
	this.validateConfigurations = function(configurations)
	{
		exceptionMessage = 'In passed configurations, following errors has occured::\n';

		for(var i in configurations){
			console.log(i);
			for(var j in configurations[i]){
				console.log(j);
				var propertyName = configurations[i][j];
				this.validateProperty(j, propertyName, i);
			}
		}

		var hasViolations = false;
		for(var context in this.violations){
			exceptionMessage += '--' + 'configuration from ' + context + '::\n'
			exceptionMessage = (context === 'service') ? '(service configuration file can be found in `' + this.configServices + '` under current service `' + this.service + '`)\n' : ''; 
			for(var i in this.violations[context]){
				exceptionMessage += '\t' + this.violations[context][i] + '\n';
				hasViolations = true;
			}
		}

		if(hasViolations) {
			throw exceptionMessage;
		}
	}

	/*
	* Adds violation in case type or value of property is not valid
	*/
	this.validateProperty = function(key, value, context)
	{
		switch(key) {
			case 'height':
			case 'width' :
				if(value <= 0 || isNaN(value)){
					this.createViolationContext(context);
					this.violations[context].push(key + ' has to be type of integer greater than 0'); 
				}
				break;
			case 'url':
				if(!this.isUrlValid(value)){
					this.createViolationContext(context);
					this.violations[context].push(key + ' has to be be valid url address in format http://domain.com[/path]'); 
				}
				break;
			case 'c':
				if(value !== null && (typeof value !== 'string' && !isNaN(value))) {
					this.createViolationContext(context);
					this.violations[context].push(key + ' has to be type of string'); 
				}
				break;
			case 'selector':
			case 'fileName':
			case 'resultPath':
			case 'screenPath':
				if(typeof value !== 'string' && !isNaN(value)) {
					this.createViolationContext(context);
					this.violations[context].push(key + ' has to be type of string'); 
				} 
				break;
			case 'widgetClasses':
			case 'types':
			case 'map':
				break;
			case 'imageFormat':
				if(value !== 'jpg' && value !== 'jpeg' && value !== 'png' && value !== 'pdf' && value !== 'bmp' && value !== ''){
					this.createViolationContext(context);
					this.violations[context].push(key + ' value has to be one of jpg|png|jpeg|pdf|bmp|ppm')	
				}
				break
			case 'marginX':
			case 'marginY':
			case 'timeout':
			case 'maximumHierarchyLevel':
				if(isNaN(value) || value === null){
					this.createViolationContext(context);
					this.violations[context].push(key + ' value has to be type of integer');	
				}
				break;
			case 'imageQuality':
			case 'removeElementsBiggerThan':
			case 'offset':
				if(!(value >= 0 && value <= 100)){
					this.createViolationContext(context);
					this.violations[context].push(key + ' value has to be >= 0 and <= 100');	
				}
				break;
			case 'generateWidgetScreenshots':
			case 'treatAsWebsite':
			case 'onlyScreen':
			case 'wrap':
			case 'useRelativeCoordinates':
			case 'showCssProperties':
			case 'hasHighcharts':
				if(typeof value !== 'boolean' && value !== 'true' && value !== 'false'){
					this.createViolationContext(context);
					this.violations[context].push(key + ' value has to be boolean value');	
				}
				break;
			//protected values -> cannot be overwritten
			case 'isServiceSupported':
			case 'configServices':
			case 'modules':
			case 'violations':
			case 'service':
			case 'customWidget':
				this.createViolationContext(context);
				this.violations[context].push(key + ' is protected value and cannot be set'); 
				break;
			default:
				this.createViolationContext(context);
				this.violations[context].push(key + ' is not supported'); 				
				break;
		}
	}


	this.createViolationContext = function(context)
	{
		if(this.violations[context] === undefined){
			this.violations[context] = [];
		}
	}

	/*
	* override default properties from ones set in configuration
	*/
	this.setProperties = function(configuration)
	{
		if (configuration === null) {
			return;
		}

		for (var i in configuration) {
			if(configuration[i] === null) {
				continue;
			}

			this[i] = configuration[i];

			if(this.includes(this.booleanValues, i)) {
				this[i] = this.convertToBoolean(configuration[i]);
			}
		}

		if (this.isServiceSupported && !this.treatAsWebsite) {
			this.customWidget = this.service + 'Widget';
		}
	}

	/*
	* @returns boolean
	*/
	this.convertToBoolean = function(value)
	{
		return (value === 'true' || value === true) ? true : false;
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
			throw "Given file doesnt exist " + path;
		}

		try{
			result = JSON.parse(fs.read(path))
		} catch(e) {
			throw 'Problem with parsing json file `' + path + '`';
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
		// var patt = /^http:\/\/\w+(\.\w+)*(:[0-9]+)?\/?(\/[.\w]*)*$/
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
	* determines whether service is supported 
	* @returns bool
	*/
	this.isSupported = function(services)
	{
		serviceSplit = this.service.split('.');

		var suppoted = false;
	    for (var i in services) {
	        if (this.includes(serviceSplit, i)) {
	        	this.service = i;
	            suppoted = true;
	            break;
	        }
	    }

	    return suppoted;
	}

	/*
	* @param string|null level representing actual hierarchy level of generated image 
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
	 	properties['maximumHierarchyLevel'] = this.maximumHierarchyLevel;
	 	properties['generateWidgetScreenshots'] = this.generateWidgetScreenshots;
	 	properties['treatAsWebsite'] = this.treatAsWebsite; //need to export?
	 	properties['marginX'] = this.marginX;
	 	properties['marginY'] = this.marginY;
	 	properties['onlyScreen'] = this.onlyScreen;
	 	properties['useRelativeCoordinates'] = this.useRelativeCoordinates;
	 	properties['showCssProperties'] = this.showCssProperties;
	 	properties['executingService'] = (this.isServiceSupported && !this.treatAsWebsite);
	 	properties['removeElementsBiggerThan'] = this.removeElementsBiggerThan;
	 	properties['offset'] = this.offset;

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
		console.log('maximumHierarchyLevel::'+this.maximumHierarchyLevel);
		console.log('treatAsWebsite::'+this.treatAsWebsite);
		console.log('generateWidgetScreenshots::'+this.generateWidgetScreenshots);
		console.log('resultPath::'+this.resultPath);
		console.log('fileName::'+this.fileName);
		console.log('screenPath::'+this.screenPath);
		console.log('marginX::'+this.marginX);
		console.log('marginY::'+this.marginY);
		console.log('customWidget::' + this.customWidget);
		console.log('onlyScreen::' + this.onlyScreen);
		console.log('absoluteResultPath::' + fs.workingDirectory + '/' + this.resultPath );
		console.log('configFileSerices:: ' +this.configServices );
		console.log('useRelativeCoordinates::'+this.useRelativeCoordinates);
		console.log('showCssProperties::' + this.showCssProperties);
		console.log('removeElementsBiggerThan::' + this.removeElementsBiggerThan);
		console.log('offset::' + this.offset);
		console.log('-----------------CONFIG END--------------------');
	}

}

exports.create = function(fs, console) {
    return new Config(fs, console);
};