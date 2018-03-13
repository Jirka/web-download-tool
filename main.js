//phantomjs modules
var page = require('webpage').create();
var system = require('system');
var fs = require('fs');

// var validator = require('./external/validator/validate.js');
// console.log(JSON.stringify(validator.validate({password: "bad"}, constraints)));

setAbsolutePathFromArguments(fs, system.args);

//custom modules
var config = require('./modules/system/Config').create(fs, console);

try{
    config.parseArguments(system.args);
    console.log(config.url);
} catch(e){
    console.log(e);
    phantom.exit(1);
}

//for debug only
config.print();

// phantom.exit(0);

//sets browser window size
page.viewportSize = {width: config.width, height: config.height};

page.open(config.url, function(status){
    if(status === 'success' || status !== 'success'){
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

                if(config.onlyScreen) {
                    return dashOut;
                }

                //configurating Service with needed modules
                var service = new Service(console);
                service.execute(config);

                if(config.wrap){
                    dashOut.newWindowSize = service.getNewWindowSize();
                }

                //creating result
                dashOut.xml = service.generateDashboardXML();
                dashOut.coordinates = service.getWidgetsCoordinates();

                return JSON.stringify(dashOut);

            }, serializableConfig); 
            //-------------------page processing end------------------------

            //deserialization of result
            dashResult = JSON.parse(dashResult);

            if(config.wrap && !config.onlyScreen){
                page.clipRect = {
                    top: dashResult.newWindowSize.y,
                    left: dashResult.newWindowSize.x,
                    width : dashResult.newWindowSize.width,
                    height: dashResult.newWindowSize.height
                }

                page.viewportSize = {width: dashResult.newWindowSize, height: dashResult.newWindowSize.height};
            }

            //takes screenshot of whole website
            page.render(config.getResultImagePath(null), {format: config.imageFormat, quality: this.imageQuality});

            //saves content of page, just for debug
            // fs.write('./content/'+config.service+'/content', page.content, 'w');

            //creates screens of widgets
            if(config.generateWidetScreenshots && !config.onlyScreen){
                renderWidgets(dashResult.coordinates, null);
            }

            //prints result xml to file
            fs.write(config.getResultXmlPath(), dashResult.xml, 'w');
            phantom.exit(0);

        }, config.timeout, config);
    }
    else{
        console.log('ERROR: could not open the page '+config.url);
        phantom.exit(1);
    }
});

/*
* recursive function to generate screens of widgets and subwidgets
*/
function renderWidgets(hierarchy, level)
{
    var newLevel = level;

    for(var i = 0; i < hierarchy.length; i++) {
        if(hierarchy[i].coord !== null){

            newLevel = (level !== null) ? level + '.' + (i+1) : i+1;

            page.clipRect = {
                top: hierarchy[i].coord.y,
                left: hierarchy[i].coord.x,
                width : hierarchy[i].coord.width,
                height: hierarchy[i].coord.height
            }

            page.render(
                config.getResultImagePath(newLevel),
                {format: config.imageFormat, quality: this.imageQuality}
            );
        }

        renderWidgets(hierarchy[i].subCoord, newLevel);
    }
}


/*
* 
*/
function setAbsolutePathFromArguments(fs, args)
{
    var absolutePath = null;
    for (var i = 0; i < args.length; i++) {
        if (args[i] === '-a') {
            var path = args[i+1];
            absolutePath = (path !== undefined) ? path : null;
        }
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
