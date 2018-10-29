//phantomjs modules
var page = require('webpage').create();
var system = require('system');
var fs = require('fs');

setAbsolutePathFromArguments(fs, system.args);

var converter = require('./external/node_modules/color-convert/index');

//custom modules
var config = require('./modules/system/Config').create(fs, console);

try{
    config.setup(system.args);
} catch(e){
    console.log(e);
    phantom.exit(1);
}

//for debug only
config.print();


//sets browser window size
page.viewportSize = {width: config.width, height: config.height};

page.open(config.url, function(status){
    setTimeout(function(config){
        //modules injection inside website context
        for(var j in config.modules){
            if(page.injectJs(config.modules[j]) === false){    
                console.log('ERROR: module '+config.modules[j]+' could not be injected');
                phantom.exit(1);
            }
        }

        //config for evaluate - only serializable object can be passed
        serializableConfig = config.makeSerializable();

        //-------------------page processing start------------------------
        var dashResult = page.evaluate(function(config){
            //result object
            var dashOut = {};

            if(!config.onlyScreen) {
                //configurating Service with needed modules
                var service = new Service(console);
                service.execute(config);

                //creating result
                dashOut.xml = service.generateDashboardXML();
                dashOut.coordinates = service.getWidgetsCoordinates();
            }

            return JSON.stringify(dashOut);

        }, serializableConfig); 
        //-------------------page processing end------------------------

        //deserialization of result
        dashResult = JSON.parse(dashResult);

        //takes screenshot of whole website
        page.render(config.getResultImagePath(null), {format: config.imageFormat, quality: this.imageQuality});
        if(config.onlyScreen) { 
            phantom.exit(0);
        }

        //saves content of page, just for debug
        // fs.write('./content/'+config.service+'/content', page.content, 'w');

        //creates screens of widgets
        if(config.generateWidgetScreenshots){
            renderWidgets(dashResult.coordinates, null);
        }

        //prints result xml to file
        fs.write(config.getResultXmlPath(), dashResult.xml, 'w');
        phantom.exit(0);

    }, config.timeout, config);
});

/*
* @returns object
*/
function getRectangle(coordinates){
    return {
        top: coordinates.y,
        left: coordinates.x,
        width : coordinates.width,
        height: coordinates.height
    };
}

/*
* recursive function to generate screens of widgets and subwidgets
*/
function renderWidgets(hierarchy, level)
{
    var newLevel = level;

    for(var i = 0; i < hierarchy.length; i++) {
        if(hierarchy[i].coord !== null){

            newLevel = (level !== null) ? level + '.' + (i+1) : i+1;

            if(hierarchy[i].coord === undefined) continue;

            page.clipRect = getRectangle(hierarchy[i].coord);

            page.render(
                config.getResultImagePath(newLevel),
                {format: config.imageFormat, quality: this.imageQuality}
            );
        }

        renderWidgets(hierarchy[i].subCoord, newLevel);
    }
}


/*
* sets path from which is phantomJs being executed
*/
function setAbsolutePathFromArguments(fs, args)
{
    var absolutePath = null;
    var index = args[0].lastIndexOf('/');
    if(index !== -1) {
        absolutePath = args[0].substr(0, index);
    }

    if (absolutePath !== null) {
        var status = fs.changeWorkingDirectory(absolutePath);
        if (!status) {
            console.log('Warning: absolutePath could not be changed from directory');
        }
    }
}

//for debug purposes only 
page.onConsoleMessage = function(msg){
      console.log(msg);
}

//error handleing
page.onError = function(msg, trace) {

      var msgStack = ['ERROR: ' + msg];

      if (trace && trace.length) {
        msgStack.push('TRACE:');
        trace.forEach(function(t) {
          msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function +'")' : ''));
      });
      }

      console.error(msgStack.join('\n'));
};
