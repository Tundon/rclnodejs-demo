#!/usr/bin/env ts-node
import { SerialPort } from 'serialport'

var count = 0;

setInterval(() => {
  console.log(count);
  count = 0;
}, 1000);

const serialport = new SerialPort({ path: '/dev/ttyACM0', baudRate: 9600 })
serialport.on("data", (data) => {
  try {
    count++;
    JSON.parse(data.toString());
  } catch (error) {
    console.error("Non JSON received", data.toString());
  }
});
