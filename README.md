# pi_button_bluetooth
Messing around with raspberry pi, bluetooth, gpio and swift.

**this code may or may not work**

## Idea
The idea behind this code was to achieve the following:
* A raspberry PI acts as a Bluetooth peripheral
* A button is pressed, that is connected to a raspberry pi (in this case a zero w)
* The press is detected via GPIO
* A message is sent via Bluetooth to a Mac computer acts as a Bluetooth peripheral
* Swift code detects the incoming message and prints out a message


## Dependencies
* bleno : is used for Bluetooth communication
* onoff : is used to detect GPIO activity

## Notes
I couldn't get bleno to compile using a new version of Node, so I've used Nodejs 8.x
