timeProvider
============

timeProvider is a time-mocking utility designed for testing scenarios where deterministic control over time is required. When activated, the module replaces global time functions with mock implementations. timeProvider.activate() should be run as early as possible, as existing intervals, timers, Performance and Date instances will not handled.

### Key Features & Usage

#### 1. Activation and Mocking Control
The module is initialized using the activate function. By default, it patches all global time APIs.

* **Signature:** `timeProvider.activate(setDate, speed, func, [options])`

* **Arguments:**
    * `setDate`: The starting date (as a string or Date object) for the mock clock.
    * `speed`: An optional multiplier for *real-time* acceleration (0 < x <= 1000). Use `advanceTime()` for deterministic control instead.
    * `func`: An optional function to be called on every tick of the accelerated clock.
    * `options`: An optional object to **selectively enable/disable patching**. Keys include `date`, `timers`, `immediate`, `raf`, and `performance` (all default to `true`).

#### 2. Deterministic Time Control (Time Travel)
The module's most powerful feature is its ability to instantly simulate the passage of time without waiting.

* **`timeProvider.advanceTime(ms)`**: Instantly moves the mock clock forward by the specified number of milliseconds (`ms`). This triggers all mocked timers (`setTimeout`, `setInterval`, `setImmediate`, `requestAnimationFrame`) that would have fired during that simulated time period.

#### 3. Global Time APIs Mocked
When activated, the following global functions are replaced and controlled by the module's mock clock:
* **Clock/High-Res:** `new Date()`, `Date.now()`, `performance.now()`
* **Standard Timers:** `setTimeout`, `setInterval`, `clearTimeout`, `clearInterval`
* **Asynchronous:** `setImmediate`, `clearImmediate` (Node.js only)
* **Browser:** `requestAnimationFrame`, `cancelAnimationFrame` (Browser only)

#### 4. Cleanup and Deactivation
* **`timeProvider.deactivate()`**: Restores all global functions (`Date`, `setTimeout`, `performance.now`, etc.) to their original, native implementations and clears all internal state, ensuring test isolation.

#### 5. Functionality
* **`timeProvider.getDate()`**: Returns the current mocked date/time.
* **`timeProvider.getStartDate()`**: Returns the original set date.
* **`timeProvider.setSpeed(x)`**: Changes the real-time acceleration multiplier (0 < x <= 1000).
* **`timeProvider.getSpeed()`**: Gets the current speed multiplier.
* **`timeProvider.addTickFunction("name", function(){})`** and **`timeProvider.removeTickFunction("name")`**: Manage functions called on every tick of the accelerated clock.
