timeProvider
============


timeProvider is a module which, when activated, will track date/time as the default Date() object does, but with a user-supplied date.
This means it can be used in testing scenarios by simply requiring the module, then calling timeProvider.activate("Custom Date Here").
Get the provided date through timeProvider.getDate(), the original set date through timeProvider.getStartDate()

Additionally, this time provider allows for accelerating the clock. The second parameter on activate is a multiplier. There is also
timeProvider.setSpeed(x). Valid numbers are 0 > x <= 1000. Get the current speed through timeProvider.getSpeed().

The third parameter on activate is a tickFunction. Each time the clock ticks, the function is called. Additional functions can be
added and removed via timeProvider.addTickFunction("name", function(){}) and timeProvider.removeTickFunction("name").

