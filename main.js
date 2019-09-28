const bleno = require('bleno');
const Gpio = require('onoff').Gpio;

console.log("Starting bleno...");

const serviceUUID = '071BC018-3E4F-46F3-88C5-2F266CEA51EA';

const buttonChar = require('./characteristic');

const gpioButton = new Gpio(4, 'in');

bleno.on('stateChange', state => {

    if (state === 'poweredOn') {
        bleno.startAdvertising('PiButton', [serviceUUID], err => {
            if (err) console.log(err);
        });

    } else {
        console.log("Stopping...");
        buttonChar.stop();
        buttonChar.stopAdvertising();
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

gpioButton.watch((err, value) => {
    if (err) {
        throw err;
    }

    buttonChar.sendNotification(1);
});

process.on('SIGINT', _ => {
    gpioButton.unexport();
});


