//
//  ViewController.swift
//  bluetoothServer
//
//  Created by Mark Haskins on 24/09/2019.
//  Copyright © 2019 Mark Haskins. All rights reserved.
//

import Cocoa

import CoreBluetooth

let Button_Service_CBUUID = CBUUID(string: "1A1523D0-71B2-4775-871C-B877BBD5B5EF")
let Button_Characteristic_CBUUID = CBUUID(string: "1A1523D0-71B2-4775-871C-B877BBD5B5EF")

class ViewController: NSViewController {

    var centralManager: CBCentralManager?
    var peripheraButton: CBPeripheral?

    override func viewDidLoad() {
        super.viewDidLoad()

        let centralQueue: DispatchQueue = DispatchQueue(label: "com.iosbrain.centralQueueName", attributes: .concurrent)
        centralManager = CBCentralManager(delegate: self, queue: centralQueue)
    }

    func decodePeripheralState(peripheralState: CBPeripheralState) {

        switch peripheralState {
            case .disconnected:
                print("Peripheral state: disconnected")
            case .connected:
                print("Peripheral state: connected")
            case .connecting:
                print("Peripheral state: connecting")
            case .disconnecting:
                print("Peripheral state: disconnecting")
        @unknown default:
            print("Received unknown state")
        }
    }
}

extension ViewController: CBCentralManagerDelegate {

    func centralManagerDidUpdateState(_ central: CBCentralManager) {

        switch central.state {

        case .unknown:
            print("Bluetooth status is UNKNOWN")
        case .resetting:
            print("Bluetooth status is RESETTING")
        case .unsupported:
            print("Bluetooth status is UNSUPPORTED")
        case .unauthorized:
            print("Bluetooth status is UNAUTHORIZED")
        case .poweredOff:
            print("Bluetooth status is POWERED OFF")
        case .poweredOn:
            print("Bluetooth status is POWERED ON")

            centralManager?.scanForPeripherals(withServices: [Button_Service_CBUUID])

        @unknown default:
            print("Received unknown state")
        }
    }
}

extension ViewController: CBPeripheralDelegate {

    func centralManager(_ central: CBCentralManager, didDiscover peripheral: CBPeripheral, advertisementData: [String : Any], rssi RSSI: NSNumber) {

        decodePeripheralState(peripheralState: peripheral.state)

        peripheraButton = peripheral
        peripheraButton?.delegate = self

        centralManager?.stopScan()
        centralManager?.connect(peripheraButton!)
    }

    func centralManager(_ central: CBCentralManager, didConnect peripheral: CBPeripheral) {

       peripheraButton?.discoverServices([Button_Service_CBUUID])
    }

    func centralManager(_ central: CBCentralManager, didDisconnectPeripheral peripheral: CBPeripheral, error: Error?) {
        centralManager?.scanForPeripherals(withServices: [Button_Service_CBUUID])
    }

    func peripheral(_ peripheral: CBPeripheral, didDiscoverServices error: Error?) {

        for service in peripheral.services! {

            if service.uuid == Button_Service_CBUUID {
                peripheral.discoverCharacteristics(nil, for: service)
            }
        }
    }

    func peripheral(_ peripheral: CBPeripheral, didDiscoverCharacteristicsFor service: CBService, error: Error?) {

       for characteristic in service.characteristics! {

           if characteristic.uuid == Button_Characteristic_CBUUID {
                peripheral.setNotifyValue(true, for: characteristic)
           }
       }
    }

    func peripheral(_ peripheral: CBPeripheral, didUpdateValueFor characteristic: CBCharacteristic, error: Error?) {

       if characteristic.uuid == Button_Characteristic_CBUUID {
            print(characteristic)
       }
    }
}
