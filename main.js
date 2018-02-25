//phantomjs modules
var page = require('webpage').create();
var system = require('system');
var fs = require('fs');

var validator = require('./external/validator/validate.js');
// console.log(JSON.stringify(validator.validate({password: "bad"}, constraints)));

//custom modules
var mockService = require('./modules/system/MockService').create(); //for testing only
var config = require('./modules/system/Config').create(mockService, fs,console);

try{
    config.parseArguments(system.args);
    console.log(config.url);
} catch(e){ // add type of exception|create new 
    console.log(e);
    phantom.exit(0);
}

config.print();

// phantom.exit(0);

//sets browsers window size
page.viewportSize = {width: config.width, height: config.height};

page.open(config.url, function(status){
    if(status === 'success'){

        setTimeout(function(config){

            //modules injection inside website context
            for(var j in config.modules){
                if(page.injectJs(config.modules[j]) === false){    
                    console.log('ERROR: module '+config.modules[j]+' couldn\'t be injected');
                    //thow and exit
                }
            }

            //takes screenshot of whole site
            page.render(
                //absolutePath + maybe getScreenPath from config -> this looks really bad
                config.resultPath+'/'+config.service+'/'+config.service + '.' + config.imageFormat, 
                {format: config.imageFormat, quality: '100'}
            );

            //save content of page, just for debug
            // fs.write('./content/'+config.service+'/content', page.content, 'w');

            //config for evaluate - only serializable object can be passed
            serializableConfig = config.makeSerializable();

            //-------------------page processing start------------------------
            var dashResult = page.evaluate(function(webConfig){
                //result object
                var dashOut = {};

                //configurating Service with needed modules
                var service = new Service(console);
                service.execute(webConfig);

                //creating result
                dashOut.xml = service.generateDashboardXML();
                dashOut.coordinates = service.getWidgetsCoordinates();

                return JSON.stringify(dashOut);

            }, serializableConfig); 
            //-------------------page processing end------------------------

            //deserialization of result
            dashResult = JSON.parse(dashResult);

            //creates screens of widgets
            if(config.generateWidetScreenshots !== false){
                renderWidgets(dashResult.coordinates, null);
            }

            //prints result xml to file
            fs.write(config.resultPath + '/' + config.service + '/' + config.service +'.xml', dashResult.xml, 'w');
            phantom.exit(0);

        }, config.timeout, config);
    }
    else{
        console.log('ERROR: couldn\'t open the page '+config.url);
        phantom.exit(1);
    }
});

function renderWidgets(hierarchy, level)
{
    var newLevel = level;

    for(var i = 0; i < hierarchy.length; i++){
        if(hierarchy[i].coord !== null){

            newLevel = (level !== null) ? level +'.' + (i+1) : i+1;

            page.clipRect = {
                top: hierarchy[i].coord.y,
                left: hierarchy[i].coord.x,
                width : hierarchy[i].coord.width,
                height: hierarchy[i].coord.height
            }

            page.render(
                config.resultPath + '/' + config.service + '/'+ config.screenPath +
                newLevel + '_' + config.service+'.'+config.imageFormat, 
                {format: config.imageFormat, quality: '100'} // constant to config
            );


            console.log(newLevel);
            console.log(config.screenPath+config.service+'/'+
                newLevel + '_' + config.service+i+'.'+config.imageFormat);
            console.log(hierarchy[i].coord);
        }

        renderWidgets(hierarchy[i].subCoord, newLevel);
    }
}


//for debug purposes only 
page.onConsoleMessage = function(msg){
      console.log(msg)
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
