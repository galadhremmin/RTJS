# TimerWidget
Creates a timer that counts down a number of seconds. Shows its current value formatted as *minutes*:*seconds*. This is just appended as text a text node inside the element.

## Binding
Bind to a number representing the number of seconds to count down.
This widget can only be bound once, and retains its state on navigation.

## Events
Sends a [Observable.Notification](class.Util.Observable.Notification) with type `zeroed` when the timer reaches zero.