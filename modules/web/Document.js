function Document(document, console) {		//probably separate modul, element
	this.document = document; //why?


	this.createAndInitWidget = function(html, config, level)
	{
		var widget = new Widget(console);
		widget.init(html, config, level);
		return widget;
	}

	this.findWidgets = function(selector) {
		return this.document.querySelectorAll(selector);
	}

	this.getBoundingClientRect = function(obj) {
		return obj.getBoundingClientRect();
	}

	this.includes = function(elems, elem) {
		var include = false;

		for (var i in elems) {
			if (elems[i] === elem) {
				include = true;
			}
		}

		return include;
	}

	//rename
	this.findIdOnLowerLevel = function(ids,obj) {	
		var returnValue = false;

		for (var i=0; i < obj.childElementCount; i++) {
			if (obj.childNodes[i].id !== undefined && this.includes(ids, obj.childNodes[i].id)) {
				//remove from ids array
				return obj.childNodes[i].id;
			}
			else{
				return this.findIdOnLowerLevel(ids,obj.childNodes[i]);
			}
		}
		return false;
	};


	//function for finding single id
	//returns HTML object|false
	this.findIdOnLowerLevelS = function(id,obj) {
		var returnValue = false;

		// if (obj.children !== undefined)
		// console.log('highcharts id find '+obj.children.length)

		for (var i in obj.children) {
			 // if (obj.children[i].id !== undefined && obj.children[i].id !== '')
				// console.log('id::'+obj.children[i].id + 'length'+ obj.children.length );
			
			if (obj.children[i].id !== undefined && id === obj.children[i].id) {
				//remove from ids array
				return obj.children[i]; //obj.childNodes[i].id --in case of more than 1 id
			}
			else{
				returnValue = this.findIdOnLowerLevelS(id, obj.children[i]);
				if (returnValue !== false) break;
			}
		}


		return returnValue;
	};

	this.findClassOnLowerLevel = function(classNames, obj) {
		for (var i in classNames) {
			//prerobit na pole
			if (obj.className.search(classNames[i]) !== -1) {
				return classNames[i];
			}

			var found = obj.getElementsByClassName(classNames[i]);
			if (found.length > 0) {
				return classNames[i];
			}
		}
		return false;
	}


	this.getElementsByClassName = function(className) {
		return this.document.getElementsByClassName(className); 
	};

	this.getElementById = function(id) {
		return this.document.getElementById(id); 

	};



	//should this be moved to datapineWidgets
	this.createNewHierarchy = function(elems) {
		var reconfig = [];
		var elemsTmp = {};
		
		//if (parent === null) continue as now
				
		console.log('input::'+elems);
		console.log('coutofInput::'+elems.length);

		for (var i in elems) {
		  if (typeof elems[i] === 'object') {
		    var rect = elems[i].getBoundingClientRect();
		    var area = rect.width * rect.height;
		    
		    if (elemsTmp[area] === undefined) elemsTmp[area] = [];
				
			elemsTmp[area].push(elems[i]);
			}
		}
				
		var sorted = Object.keys(elemsTmp).sort(function(a, b) {return b-a});
		
		var elements = [];
		var elemMap = {};
		var uid = 1; //better solution?
		var doc = document.createElement('div');
		for (var i = 0; i < sorted.length; i++) {
		  for (var j in elemsTmp[sorted[i]]) {
		    var e = elemsTmp[sorted[i]][j];
				
			var client = e.getBoundingClientRect();
			var attr = {
				'class' : e.className, 
				'height' : client.height, 
				'width' : client.width, 
				'x' : client.left, 
				'y' : client.top, 
				'xx' : client.right, 
				'yy' : client.bottom,
				'id' : uid
			};

			console.log('id-------------------------'+uid)

		    var el = document.createElement('div'); 
		    for (var l in attr) { 
		    	el.setAttribute(l, attr[l]);
		    }

		    var a = el.getBoundingClientRect();

		    var ol = this.overlapElems(e, elements);
		    if (ol !== false) {
		      ol.appendChild(el);
		    }
		    else{
		      doc.appendChild(el);
		    }
				
			elements.push(el);
			console.log('canbe called'+e.getBoundingClientRect());
			elemMap[uid] = e;
			uid++;
		  }
		}


		console.log(doc.children.length);
		return {'html' : doc, 'elems' : elemMap};
		return doc;
	};


	this.createNewHierarchyS = function(elems, parent) {
		var reconfig = [];
		var elemsTmp = {};
				
		//if (parent === null) continue as now
				
		for (var i in elems) {
		  if (typeof elems[i] === 'object') {
		    var rect = elems[i].getBoundingClientRect();
		    var area = rect.width * rect.height;
		    
		    if (elemsTmp[area] === undefined) { 
		    	elemsTmp[area] = [];
		    }
				
			elemsTmp[area].push(elems[i]);
			}
		}
				
		var sorted = Object.keys(elemsTmp).sort(function(a, b) {return b-a});
		
		var elements = [];
		var elemMap = {};
		var uid = 1; //better solution?
		var doc = document.createElement('div');
		for (var i = 0; i < sorted.length; i++) {
		  for (var j in elemsTmp[sorted[i]]) {
		    var e = elemsTmp[sorted[i]][j];
				
			var client = e.getBoundingClientRect();
			var attr = { 
				'x' : client.left, 
				'y' : client.top, 
				'xx' : client.right, 
				'yy' : client.bottom,
				'id' : uid
			};

		    var el = document.createElement('div'); 
		    for (var l in attr) {
		    	el.setAttribute(l, attr[l]);
		    }

		    if (parent === null) {
		    	if (!this.overlapElems(e, elements)) {
		    		doc.appendChild(el);
					elements.push(el);
		    	}
		    }
		    else{
		    	console.log('som v parent vetve')
		    	if (this.overlap(e, parent)) {
		    		doc.appendChild(el);
		    	}
		    }
				
			elemMap[uid] = e;
			uid++;
		  }
		}


		console.log(doc.children.length);
		return {'html' : doc, 'elems' : elemMap};
		return doc;
	};



	//returns overlaping elem/false
	this.overlapElems = function(el, elems) {
		for (var i in elems) {
		  var rectEl = el.getBoundingClientRect();
		
	      if (elems[i].getAttribute('x') <= rectEl.left &&
	          elems[i].getAttribute('xx') >= rectEl.right &&
	          elems[i].getAttribute('y') <= rectEl.top &&
	          elems[i].getAttribute('yy') >= rectEl.bottom
	        ) {
	        return elems[i];
	      }
	    }
	    return false;
	};

	this.createNewHierarchySS = function(elems, parent) {
		var elemMap = {};
		var doc = document.createElement('div');

		for (var i in elems) {
			if (typeof elems[i] === 'object') {

			// a = parent.getBoundingClientRect();
			// console.log( a.left + "x" + a.top + 'x'+a.width + 'x' + a.height);
			// a = elems[i].getBoundingClientRect();
			// console.log( a.left + "x" + a.top + 'x'+a.width + 'x' + a.height);
			// console.log('');

			var client = elems[i].getBoundingClientRect();
			var attr = { 
				'x' : client.left, 
				'y' : client.top, 
				'xx' : client.right, 
				'yy' : client.bottom,
				'id' : i
			};

		    var el = document.createElement('div'); 
		    for (var l in attr) {
		    	el.setAttribute(l, attr[l]);
		    }

			if (this.overlap(elems[i], parent)) {
				doc.appendChild(el);
				elemMap[i] = elems[i];
				console.log('ok, appending')
			}
			}
		}

		return {'html' : doc, 'elems' : elemMap};
	}

	//returns bool
	this.overlap = function(el, parent) {
		var rectEl = el.getBoundingClientRect();
		var parentRect = parent.getBoundingClientRect();
		
	    if (parentRect.left < rectEl.left &&
	       parentRect.right > rectEl.right &&
	       parentRect.top < rectEl.top &&
	       parentRect.bottom > rectEl.bottom
	    ) {
	        return true;
	    }
	    
	    return false;
	};



	//from translate module
		this.transform = function(coordinates) {
		var mapping = {'left' : 'x', 'top' : 'y', 'width' : 'width', 'height' : 'height'};
		var result = {};

		for (var i in mapping) {
			result[mapping[i]] = Math.round(coordinates[i]);
		}

		return result;
	};

	this.translateIds = function(objIds) {
		for (var d in objIds) {
			if (objIds[d].id !== undefined) {
				var coo = document.getElementById(objIds[d].id).getBoundingClientRect();
				var prop = ['width', 'height', 'left', 'top'];
				for (s in prop) {
					objIds[d][prop[s]] = coo[prop[s]];
					console.log(prop[s]+"::"+objIds[d][prop[s]]);
				}
				//deletes id from object
				delete objIds[d].id;
			}
		}
	};



	//rect = dash[i].getBoundingClientRect();

	//var dash = document.querySelectorAll(data.selector);

}