import Aedes from 'aedes'
import { createServer } from 'net'


import { AudioDeviceMonitor, AudioMonitorOptions } from './new_af';
import { handlerMQTT } from './mqtt-handlers';

const PORT = 1883;
const options: AudioMonitorOptions = {
  delay: 100,
  step: 5,
  autoStart: true,
  logger: false
}
export const AudioMonitor = new AudioDeviceMonitor(
  options
);

export const aedes = new Aedes({
  id: 'mqtt-broker',
})
const server = createServer(aedes.handle)

server.listen(PORT, function () {
  console.log('start broker ', PORT);
})

handlerMQTT()