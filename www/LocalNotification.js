/*
 * Cordova/PhoneGap 3.0.0+ LocalNotification Plugin
 * Original author: Olivier Lesnicki
 */
 
function triggerEvent(elem, evtName, evtData) {
	var evt;
	evtData = evtData || {bubbles:true, cancelable:true, detail:undefined};
	
	if(window.CustomEvent) {
		evt = new CustomEvent(evtName, evtData);
	} else {
		evt = document.createEvent( 'CustomEvent' );
		evt.initCustomEvent( evtName, evtData.bubbles, evtData.cancelable, evtData.detail );
	}
	
	elem.dispatchEvent(evt);
}

//------------------------------------------------------------------------------
// object that we're exporting
//------------------------------------------------------------------------------
var localNotifier = {
	queue: [], //TODO: Rename
	REPEAT_INTERVAL: {
		"HOURLY"	: "hourly",
		"DAILY"		: "daily",
		"WEEKLY"	: "weekly",
		"MONTHLY"	: "monthly",
		"QUARTERLY"	: "quarterly",
		"YEARLY"	: "yearly",
	},
	
	flushQueue: function( callback ) {
		var n = this.queue.length;
		while(n--) {
			callback(this.queue.shift());
		}
	},
	receiveNotification: function(data) {
		// Delay needed to give "resume" time to finish
		var self = this;
		window.setTimeout(function() {
			self.queue.push(data);
			triggerEvent(document, "notification-receive", {bubbles:true, cancelable:true, detail:data});
		}, 10);
	},
	
	add: function(success, fail, options) {
		steal.dev.log("Adding Notification with options: " + JSON.stringify(options));
		
		if( Object.prototype.toString.call(options.fireDate) === '[object Date]' ) {
			options.fireDate = Math.round(options.fireDate.getTime()/1000);
		}
		
		if( !options.fireDate ) {
			options.fireDate = 0;
		}
		
		if( !options.alertBody && options.alertBody != 0) {
			options.alertBody = "";
		}
		
		options.repeatInterval = this.REPEAT_INTERVAL[ ('' + options.repeatInterval).toUpperCase() ];
		if( !options.repeatInterval ) {
			options.repeatInterval = 0;
		}
		
		if( !options.intervalId && options.intervalId != 0 ) {
			options.intervalId = "localnotification_" + Math.round(Math.random() * 100000000);
		}
		
		// "null" is valid json where "undefined" is not
		if( !options.callbackData && options.callbackData != 0 ) {
			options.callbackData = "null";
		}
		
		cordova.exec(success, fail, "LocalNotification", "addNotification", [
			options.fireDate,
			options.alertBody,
			options.repeatInterval,
			options.intervalId,
			options.callbackData
		]);
	},
	
	cancel: function(str, callback) {
	    cordova.exec(callback, null, "LocalNotification", "cancelNotification", [str]);
	},
	
	//------------------------------------------------------------------------------  
	cancelAll: function(callback) {
	    cordova.exec(callback, null, "LocalNotification", "cancelAllNotifications", []);
	}
};

module.exports = localNotifier;