const bleno = require('bleno');
const Gpio = require('onoff').Gpio;

var buttonIO = new Gpio(4, 'in', 'rising',{debounceTimeout: 10} );

console.log("Starting bleno...");

const serviceUUID = '1A1523D0-71B2-4775-871C-B877BBD5B5EF';
const characteristicUUID = '1A1523D0-71B2-4775-871C-B877BBD5B5EF';

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
        console.log(`ButtonChar subscribed, max value size is ${maxValueSize}`);
        this.updateValueCallback = updateValueCallback;
    }

    onUnsubscribe() {
        console.log("ButtonChar unsubscribed");
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

    start() {
        console.log("Starting ButtonChar");
//        this.handle = setInterval(() => {
//            this.counter = (this.counter + 1) % 0xFFFF;
//            this.sendNotification(this.counter);
//        }, 1000);
    }

    stop() {
        console.log("Stopping ButtonChar");
        clearInterval(this.handle);
        this.handle = null;
    }
}

let buttonChar = new ButtonCharacteristic();
buttonChar.start();


bleno.on('stateChange', state => {

  if (state === 'poweredOn') {
    bleno.startAdvertising('red', [serviceUUID], err => {
        if (err) console.log(err);
    });

  } else {
    console.log("Stopping...");
    buttonChar.stop();
    bleno.stopAdvertising();
  }

});

bleno.on('advertisingStart', err => {

  console.log("Configuring services...");

  if(err) {
      console.error(err);
      return;
  }

  let service = new bleno.PrimaryService({
      uuid: serviceUUID,
      characteristics: [buttonChar]
  });

  bleno.setServices([service], err => {
      if(err)
          console.log(err);
      else
          console.log("Services configured");
  });
});


buttonIO.watch((err, value) => {
  if (err) {
    throw err;
  }

  console.log("Button Pressed");
  buttonChar.sendNotification(1);
});

process.on('SIGINT', _ => {
  console.log("Exit");
  buttonIO.unexport();
});

// some diagnostics
bleno.on("stateChange", state => console.log(`Bleno: Adapter changed state to ${state}`));

bleno.on("advertisingStart", err => console.log("Bleno: advertisingStart"));
bleno.on("advertisingStartError", err => console.log("Bleno: advertisingStartError"));
bleno.on("advertisingStop", err => console.log("Bleno: advertisingStop"));

bleno.on("servicesSet", err => console.log("Bleno: servicesSet"));
bleno.on("servicesSetError", err => console.log("Bleno: servicesSetError"));

bleno.on("accept", clientAddress => console.log(`Bleno: accept ${clientAddress}`));
bleno.on("disconnect", clientAddress => console.log(`Bleno: disconnect ${clientAddress}`));

