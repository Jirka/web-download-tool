# Website download tool

## CLI arguments

```
./phantomjs main.js [url] -c <file> [-a <path>]
```

##Suppored services
TODO

## Custom processing
TODO

## Configuration
Configuration file MUST be in JSON format. Other formats are not supported.

### Parameters
Listed below are properties which can be set in configuration file. Specification of each will come later in this document. Properties which are NOT included in this list are ignored during execution. The order of properties is not considered.
```
    url
    selector
    height
    width
    marginX
    marginY
    timeout
    widgetClasses
    fileName
    resultPath
    screenPath
    generateWidgetScreenshots
    imageFormat
    imageQuality
    treatAsWebsite
    maxHierarchyLevel
```


### Default values
Listed below are preconfigured values of properties. The ones not listed are either service or website dependant.
```Javascript
{
	"height" : 1200,
	"width" : 1200,
	"marginX" : 0,
	"marginY" : 0,
	"timeout" : 5000,
	"widgetClasses" : [],
	"resultPath" : "/result",
	"screenPath" : "/screens",
	"generateWidgetScreenshots" : false,
	"imageFormat" : "png",
	"imageQuality" : 100,
	"treatAsWebsite" : false,
	"maxHierarchyLevel" : 1
}
```

### Properties

#### URL
Determines which website will be analyzed. Property MUST be set either in configuration file or passed from CLI. When set in both places, configuration HAS higher priority. Value MUST BE represented in proper URL format, this means that `http` or `https` cannot be excluded. Any other format WILL result in error.

```Javascript
{ "url" : http|https://your-website.com }
```

#### Selector
This property will be used in search for components in website hierarchy. Property is optional, non the less when not specified no components of website will be find. Format is constrained to CSS selector. Meaning `.class`, `#id`, `tag`.


```Javascript
{ "selector" : string }
```

#### Height and Width
Determines size of browser window in pixels.

```Javascript
{ 
	"height" : integer,
	"width" : integer
}
```

#### Margin
Determines margin in pixels. Property with suffix X in horizontal direction, the other with suffix Y in vertical direction. 

```Javascript
{ 
	"marginX" : integer, 
	"marginY" : integer
}
```

#### Timeout
Determines how long should program wait before its own exectution. Might be useful especially with javascript rendered websites.

```Javascript
{ "timeout" : integer }
```

#### Widget classes
TODO

```Javascript
{ "widgetClasses" : array }
```

#### File name
Determines how will screenshot of whole site and generated xml be named. When not specified website name WILL be used.

```Javascript
{ "filename" : string }
```

#### Result path
Determines where the result of generated services or website will be saved. It can be either absolute path or relative towards script location. Relative path cannot contain `/`

```Javascript
{ 
	"result" : string 
}
```

#### Widget screen generation
`generateWidgetScreenshots` is a flag which determines whether screenshots of every widget should be generated. When set to `true`, result of generated screenshots will be saved to `screenPath` location. This location is relative towards property `resultPath` and cannot contain leading `/`.

 
```Javascript
{ 
	"screenPath" : string,
	"generateWidgetScreenshots" : boolean
}
```

#### Image config
This set of properties determines screenshot characteristic. Property `imageQuality`  determines quality of image and its value MUST BE in range of 0-100. 0 = lowest, 100 = highest. Value HAS impact on size of rendered file.

```Javascript
{ 
	"imageFormat" : png|jpeg|pdf|bmp|ppm,
	"imageQuality" : <0-100>
}
```

#### TreatAsWebsite
This flag only HAS effect in combination with supported services. When set to `true`, it overwrites service specific module with website module, no special treatment will be applied to execution of service.  

```Javascript
{ "treatAsWebsite" : boolean }
```


#### Hierarchy level
Determines maximum level of hierarchy when creating subwidgets.

```Javascript
{ "maxHierarchyLevel" : integer }
```
