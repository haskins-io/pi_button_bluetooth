const bleno = require('bleno');

const characteristicUUID = '91FE5323-ED66-423E-9723-519D5AF0422F';

class ButtonCharacteristic extends bleno.Characteristic {

    constructor() {

        super({
            uuid: characteristicUUID,
            properties: ["notify"],
            value: null
        });

        this.counter = 0;
    }

    onSubscribe(maxValueSize, updateValueCallback) {
        console.log(`Button subscribed, max value size is ${maxValueSize}`);
        this.updateValueCallback = updateValueCallback;
    }

    onUnsubscribe() {
        console.log("Button unsubscribed");
        this.updateValueCallback = null;
    }

    sendNotification(value) {

        if(this.updateValueCallback) {
            console.log(`Sending notification with value ${value}`);

            const notificationBytes = new Buffer(2);
            notificationBytes.writeInt16LE(value);

            this.updateValueCallback(notificationBytes);
        }
    }

    // start() {
    //     console.log("Starting Button");
    //     this.handle = setInterval(() => {
    //         this.counter = (this.counter + 1) % 0xFFFF;
    //         this.sendNotification(this.counter);
    //     }, 1000);
    // }

    stop() {
        console.log("Stopping button");
        clearInterval(this.handle);
        this.handle = null;
    }
}

module.exports = ButtonCharacteristic;
