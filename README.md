# Website download tool

## Installation

1. Checkout the repository.
2. Go to the repository ``cd web-download-tool/``
3. run ``./prepare.sh`` (requires node.js and wget)
4. Wait until the script downloads 3rd party dependencies

## Usage

### CLI arguments

```
./phantomjs main.js (-url <url> | -c <path>) [optional parameters]
```

- [``-url <url>``](https://github.com/aduss/web-download-tool#url) - specifies URL of web page if it is not specified in main.js
- [``-c <path>``](https://github.com/aduss/web-download-tool#configuration-file) - path to the configuration file which defines parameters of downloading
- optional parameters which overrides the parameters defined in the configuration file
  - [``-resultPath <path>``](https://github.com/aduss/web-download-tool#result-path)
  - [``-fileName <file_name>``](https://github.com/aduss/web-download-tool#file-name)
  - [``-imageFormat <extension_name>``](https://github.com/aduss/web-download-tool#image-config)
  - [``-selector <name>``](https://github.com/aduss/web-download-tool#selector)
  - [``-width <integer>``](https://github.com/aduss/web-download-tool#height-and-width)
  - [``-height <integer>``](https://github.com/aduss/web-download-tool#height-and-width)
  - [``-marginX <integer>``](https://github.com/aduss/web-download-tool#margin)
  - [``-marginY <integer>``](https://github.com/aduss/web-download-tool#margin)
  - [``-timeout <integer>``](https://github.com/aduss/web-download-tool#timeout)
  - [``-maximumHierarchyLevel <integer>``](https://github.com/aduss/web-download-tool#hierarchy-level)
  - [``-onlyScreen (true|false)``](https://github.com/aduss/web-download-tool#only-screen)
  - [``-generateWidgetScreenshots (true|false)``](https://github.com/aduss/web-download-tool#widget-screen-generation)
  
TODO: implement short versions of parameters

### Configuration file

Configuration file MUST be in JSON format. Other formats are not supported.

#### Parameters

Listed below are properties which can be set in configuration file. Specification of each will come later in this document. Properties which are NOT included in this list are ignored during execution. The order of properties is not considered.

```
    url
    resultPath
    fileName
    imageFormat
    imageQuality
    selector
    width
    height
    marginX
    marginY
    timeout
    maxHierarchyLevel
    generateWidgetScreenshots
    screenPath
    onlyScreen
    treatAsWebsite
    widgetClasses
```


#### Default values

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

#### Properties

##### URL
Determines which website will be analyzed. The property MUST be set either in the configuration file or passed from CLI. When set in both places, configuration HAS a higher priority. The value MUST BE represented in proper URL format, this means that `http` or `https` cannot be excluded. Any other format WILL result returns an error.

```Javascript
{ "url" : http|https://your-website.com }
```

##### Result path
Determines where the result of generated services or website will be saved. It can be either an absolute path or relative towards script location. The relative path cannot contain `/`

```Javascript
{ 
	"result" : string 
}
```

##### File name
Determines the name of the screenshot of whole site and generated xml. If not specified, website's name WILL be used.

```Javascript
{ "filename" : string }
```

##### Image config
This set of properties determines characteristics of screenshot. The `imageQuality` property determines the quality of the image and its value MUST BE in range of 0-100. 0 = lowest, 100 = highest. The value HAS impact on the size of the rendered file.

```Javascript
{ 
	"imageFormat" : png|jpeg|pdf|bmp|ppm,
	"imageQuality" : <0-100>
}
```

##### Selector
This property will be used in the search for components in the website hierarchy. The property is optional. If not specified, no components of website will be found. The format corresponds to CSS selector. Meaning `.class`, `#id`, `tag`.


```Javascript
{ "selector" : string }
```

##### Height and Width
Determines the size of a browser window in pixels.

```Javascript
{ 
	"height" : integer,
	"width" : integer
}
```

##### Margin
Determines the margin in pixels. The Property with the X suffix in the horizontal direction and the Y suffix in the vertical direction. 

```Javascript
{ 
	"marginX" : integer, 
	"marginY" : integer
}
```

##### Timeout
Determines how long should the application wait for downloading the web page. Might be useful especially with the rendered websites using Javascript.

```Javascript
{ "timeout" : integer }
```

##### Hierarchy level
Determines the maximum level of hierarchy when creating subwidgets.

```Javascript
{ "maxHierarchyLevel" : integer }
```

##### Widget screen generation
The `generateWidgetScreenshots` property is a flag which determines whether a screenshots of every widget should be generated. When it is set to `true`, the generated screenshots will be stored in the `screenPath` location. This location is relative towards the property `resultPath` and cannot contain leading `/`.

 
```Javascript
{ 
	"screenPath" : string,
	"generateWidgetScreenshots" : boolean
}
```

##### Only screen
The `onlyScreen` property is a flag which determines whether only a screenshots of web page should be exported.
 
```Javascript
{ 
	"onlyScreen" : boolean,
}
```

##### TreatAsWebsite
This flag HAS only an effect in the combination with the supported services. When it is set to `true`, it overrides a service module with website module, no special treatment will be applied to execution of service.  

```Javascript
{ "treatAsWebsite" : boolean }
```

##### Widget classes
TODO

```Javascript
{ "widgetClasses" : array }
```
