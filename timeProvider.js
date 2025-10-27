var globalContext = (typeof globalThis !== 'undefined' && globalThis) || (typeof window !== 'undefined' && window) || (typeof global !== 'undefined' && global);
var setIntervalRef = globalContext ? globalContext.setInterval : setInterval;
var clearIntervalRef = globalContext ? globalContext.clearInterval : clearInterval;

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
		var onTickInterval = false; 
		
		if(intervalFunc && typeof(intervalFunc)==="function") {
			tickFunctions._main = intervalFunc;
			tickFunctionNames.push("_main");
		}
		
		var intervalFuncs = function() {
			for(var i = 0; i<tickFunctionNames.length; i++) {
				tickFunctions[tickFunctionNames[i]]();
			}
		};
		
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
			},
			
			// --- Fix B.2: Setter for the 10ms interval ---
			setOnTickInterval: function(intervalId) {
				onTickInterval = intervalId;
			},
			
			deactivate: function() {
				if(timeInterval) {
					clearIntervalRef(timeInterval);
					timeInterval = false;
				}
				if(onTickInterval) {
					clearIntervalRef(onTickInterval);
					onTickInterval = false;
				}

			}
		};
	};
	
	var timeProvider = {};
	function activate(setDate, speed, func) {
		timeProvider = new TimeProviderFactory(setDate,speed,func);
		

		var onTickIntervalId = setIntervalRef(timeProvider.executeOnTickFunctions, 10); 
		timeProvider.setOnTickInterval(onTickIntervalId);
	}
	
	export var TimeProvider = {
		activate : function(setDate, speed, func) { activate(setDate, speed, func); },
		getDate : function() { return timeProvider.getDate(); },
		setSpeed: function(speed) { timeProvider.setSpeed(speed); },
		getStartDate: function() { return timeProvider.getStartDate(); },
		addTickFunction: function(name, func) { timeProvider.addTickFunction(name, func); },
		removeTickFunction: function(name) { timeProvider.removeTickFunction(name); },
		onTickFunction: function(name, func) { timeProvider.onTickFunction(name,func); },
		getSpeed: function() { timeProvider.getSpeed(); },
		deactivate: function() { timeProvider.deactivate(); }
	}
