// --- Start of Fix C.1: Cross-Environment Timer Abstraction ---
// Detect the appropriate global context for timers (window in browsers, global in Node, or globalThis).
var globalContext = (typeof globalThis !== 'undefined' && globalThis) || (typeof window !== 'undefined' && window) || (typeof global !== 'undefined' && global);
var setIntervalRef = globalContext ? globalContext.setInterval : setInterval;
var clearIntervalRef = globalContext ? globalContext.clearInterval : clearInterval;
// --- End of Fix C.1 ---

    var TimeProviderFactory = function(objDate, objMultiplier, intervalFunc) {
		if(!(objDate instanceof Date))
			objDate = new Date(objDate);
			
		var testDate = !isNaN(objDate.getTime()) ? objDate : new Date();
		var dateDiff = (new Date()).getTime() - testDate.getTime();
		var accelDate = testDate;
		var speed = parseInt(objMultiplier,10) || 1;
		speed = speed > 1000 ? 1000 : speed;
		speed = speed <= 0 ? 1 : speed;
		
		function fauxDate() {
			var currentDate = new Date();
			var sinceAccel = (currentDate.getTime()-dateDiff) - accelDate.getTime();
			return new Date(accelDate.getTime() + (sinceAccel*speed));
		}
		var intVal = 1000/objMultiplier;
		
		var tickFunctions = [];
		var tickFunctionNames = [];
		var onTickFunctions = [];
		
		var timeInterval = false;
		if(intervalFunc && typeof(intervalFunc)==="function") {
			tickFunctions._main = intervalFunc;
			tickFunctionNames.push("_main");
		}
		
		var intervalFuncs = function() {
			for(var i = 0; i<tickFunctionNames.length; i++) {
				tickFunctions[tickFunctionNames[i]]();
			}
		};
		
		// Replaced window.setInterval with setIntervalRef
		timeInterval = setIntervalRef(intervalFuncs, intVal);
		
		return {
			getDate: function() {
				return fauxDate();
			},
			
			setSpeed: function(multiplier) {
				multiplier = parseInt(multiplier,10) || 1;
				multiplier = multiplier > 1000 ? 1000 : multiplier;
				multiplier = multiplier <= 0 ? 1 : multiplier;
				intVal = 1000/multiplier;
				accelDate = new Date(fauxDate());
				dateDiff = (new Date()).getTime() - accelDate.getTime();
				speed = multiplier;
				if(timeInterval) {
				// Replaced clearInterval and window.setInterval
				clearIntervalRef(timeInterval);
				timeInterval = setIntervalRef(intervalFuncs, intVal);
				}
			},
			getStartDate: function() {
				return testDate;
			},
			addTickFunction: function(name, func) {
				tickFunctions[name] = func;
				tickFunctionNames.push(name);
			},
			onTickFunction: function(d, func) {
				onTickFunctions[d.toString()] = func;
			},
			removeTickFunction: function(name) {
				// Replaced clearInterval and window.setInterval
				clearIntervalRef(timeInterval);
				tickFunctionNames.splice(tickFunctionNames.indexOf(name),1);
				delete tickFunctions[name];
				timeInterval = setIntervalRef(intervalFuncs, intVal);
			},
			getSpeed: function() {
				return speed;
			},
			executeOnTickFunctions: function() {
				onTickFunctions[fauxDate()] ? onTickFunctions[fauxDate()]() : void();
			}
		};
	};
	
	var timeProvider = {};
	function activate(setDate, speed, func) {
		timeProvider = new TimeProviderFactory(setDate,speed,func);
		// Replaced window.setInterval with setIntervalRef
		setIntervalRef(executeOnTickFunctions(),10); 
	}
	
	export var TimeProvider = {
		activate : function(setDate, speed, func) { activate(setDate, speed, func); },
		getDate : function() { return timeProvider.getDate(); },
		setSpeed: function(speed) { timeProvider.setSpeed(speed); },
		getStartDate: function() { return timeProvider.getStartDate(); },
		addTickFunction: function(name, func) { timeProvider.addTickFunction(name, func); },
		removeTickFunction: function(name) { timeProvider.removeTickFunction(name); },
		onTickFunction: function(name, func) { timeProvider.onTickFunction(name,func); },
		getSpeed: function() { timeProvider.getSpeed(); }
	}
