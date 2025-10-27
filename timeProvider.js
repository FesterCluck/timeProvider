var globalContext = (typeof globalThis !== 'undefined' && globalThis) || (typeof window !== 'undefined' && window) || (typeof global !== 'undefined' && global);
var setIntervalRef = globalContext ? globalContext.setInterval : setInterval;
var clearIntervalRef = globalContext ? globalContext.clearInterval : clearInterval;

var OriginalDate = globalContext.Date;
var isPatched = false;

var OriginalSetTimeout = globalContext.setTimeout;
var OriginalClearTimeout = globalContext.clearTimeout;
var OriginalSetInterval = globalContext.setInterval;
var OriginalClearInterval = globalContext.clearInterval;

var OriginalSetImmediate = globalContext.setImmediate;
var OriginalClearImmediate = globalContext.clearImmediate;

var timers = {};
var nextTimerId = 1;
var timersPatched = false;

function MockSetTimeout(callback, delay) {
    var id = nextTimerId++;
    timers[id] = {
        callback: callback,
        delay: delay,
        isInterval: false,
        mockExecutionTime: MockDate.now() + delay
    };
    return id;
}

function MockSetInterval(callback, delay) {
    var id = nextTimerId++;
    timers[id] = {
        callback: callback,
        delay: delay,
        isInterval: true,
        mockExecutionTime: MockDate.now() + delay
    };
    return id;
}

function MockSetImmediate(callback) {
    var id = nextTimerId++;
    var immediateDelay = 1;
    timers[id] = {
        callback: callback,
        delay: immediateDelay,
        isInterval: false,
        mockExecutionTime: MockDate.now() + immediateDelay
    };
    return id;
}

function MockClearTimeout(id) {
    delete timers[id];
}

function MockClearInterval(id) {
    delete timers[id];
}

function MockClearImmediate(id) {
    delete timers[id];
}

function MockDate() {
    if (arguments.length === 0) {
        return timeProvider.getDate();
    }
    
    return new (OriginalDate.bind.apply(OriginalDate, [null].concat(Array.prototype.slice.call(arguments))))();
}

MockDate.now = function() {
    if (timeProvider && timeProvider.getDate) {
        return timeProvider.getDate().getTime();
    }
    return OriginalDate.now();
};

MockDate.prototype = OriginalDate.prototype;
MockDate.UTC = OriginalDate.UTC;
MockDate.parse = OriginalDate.parse;

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
		
        function executeDueTimers(endTime) {
            var timerIds = Object.keys(timers).sort(function(a, b) {
                return timers[a].mockExecutionTime - timers[b].mockExecutionTime;
            });

            for (var i = 0; i < timerIds.length; i++) {
                var id = timerIds[i];
                var timer = timers[id];
                
                if (timer && timer.mockExecutionTime <= endTime) {
                    try {
                        timer.callback();
                    } catch (e) {
                        console.error("Error executing mock timer callback:", e);
                    }

                    if (timer.isInterval) {
                        timer.mockExecutionTime += timer.delay;
                        while (timer.mockExecutionTime <= endTime) {
                             try {
                                timer.callback();
                            } catch (e) {
                                console.error("Error executing mock interval callback:", e);
                            }
                            timer.mockExecutionTime += timer.delay;
                        }
                    } else {
                        delete timers[id];
                    }
                }
            }
        }

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

			},

            advanceTime: function(ms) {
                if (typeof
