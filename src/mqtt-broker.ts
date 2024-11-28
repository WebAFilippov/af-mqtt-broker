import Aedes from 'aedes'
import { createServer } from 'net'
import figlet from "figlet";

import { AudioDeviceMonitor, AudioMonitorOptions } from './new_af';
import { handlerMQTT } from './mqtt-handlers';

const PORT = 1883;
const options: AudioMonitorOptions = {
  delay: 100,
  step: 5,
  autoStart: false,
  logger: true
}

export const AudioMonitor = new AudioDeviceMonitor(
  options
);
export const aedes = new Aedes({
  id: 'mqtt-broker',
})
const server = createServer(aedes.handle)

server.listen(PORT, function () {
  console.log(figlet.textSync("server zapuxen - port " + PORT + "!", { font: 'Moscow' }));
})

handlerMQTT()