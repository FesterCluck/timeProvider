var globalContext = (typeof globalThis !== 'undefined' && globalThis) || (typeof window !== 'undefined' && window) || (typeof global !== 'undefined' && global);
var setIntervalRef = globalContext ? globalContext.setInterval : setInterval;
var clearIntervalRef = globalContext ? globalContext.clearInterval : clearInterval;

var OriginalDate = globalContext.Date;
var datePatched = false;

var OriginalSetTimeout = globalContext.setTimeout;
var OriginalClearTimeout = globalContext.clearTimeout;
var OriginalSetInterval = globalContext.setInterval;
var OriginalClearInterval = globalContext.clearInterval;

var OriginalSetImmediate = globalContext.setImmediate;
var OriginalClearImmediate = globalContext.clearImmediate;

var OriginalRAF = globalContext.requestAnimationFrame;
var OriginalCAF = globalContext.cancelAnimationFrame;

var OriginalPerformance = globalContext.performance;
var OriginalPerformanceNow = OriginalPerformance ? OriginalPerformance.now : undefined;
var performancePatched = false;
var mockPerformanceStartTime = 0;

var timers = {};
var nextTimerId = 1;
var timersPatched = false;

var immediatePatched = false;
var rafPatched = false;


function MockSetTimeout(callback, delay) {
    var id = nextTimerId++;
    timers[id] = {
        callback: callback,
        delay: delay,
        isInterval: false,
        isRAF: false,
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
        isRAF: false,
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
        isRAF: false,
        mockExecutionTime: MockDate.now() + immediateDelay
    };
    return id;
}

function MockRAF(callback) {
    var id = nextTimerId++;
    var frameDelay = 1;
    timers[id] = {
        callback: callback,
        delay: frameDelay,
        isInterval: false,
        isRAF: true,
        mockExecutionTime: MockDate.now() + frameDelay
