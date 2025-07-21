import { aedes, AudioMonitor } from "./mqtt-broker";
import { IDevice } from "./new_af";

let isDisconnect: boolean | null = null
let intervalStart: NodeJS.Timeout | null = null;

let deviceValue: IDevice = { id: "", name: "", volume: 0, muted: false }
let newDefaultValue: IDevice = { id: "", name: "", volume: 0, muted: false }

export const handlerMQTT = () => {
  AudioMonitor.on('change', (deviceInfo, change) => {
    // console.log(deviceInfo)
    newDefaultValue = deviceInfo
    if (change.id) {
      console.log(deviceInfo.id)
    }
    if (change.name) {
      console.log(deviceInfo.name)
    }
    if (change.volume) {
      if (newDefaultValue.volume > deviceValue.volume) {
        sendToClientsIncrementVolume(newDefaultValue)
        // sendToProcessIncrementVolume()
      }
      if (newDefaultValue.volume < deviceValue.volume) {
        sendToClientsDecrementVolume(newDefaultValue)
        // sendToProcessDecrementVolume()
      }
    }
    if (change.muted) {
      console.log('change mute:: ', deviceInfo.muted)
    }
    deviceValue = deviceInfo
  });

  aedes.on('client', (client) => {
    console.log(`Клиент подключен: ${(client ? client.id : 'неизвестный')}`);
    AudioMonitor.start()

    isDisconnect = false
    intervalStart = setInterval(() => {
      if (!AudioMonitor.isWork() && !isDisconnect) {
        AudioMonitor.start()
      }
    }, 1000) as NodeJS.Timeout
  });

  aedes.on('clientDisconnect', (client) => {
    console.log(`Клиент отключился: ${client.id}`)
    AudioMonitor.stop();

    isDisconnect = true
    clearInterval(intervalStart as NodeJS.Timeout)
    intervalStart = null
  });

  aedes.on('publish', (packet, client) => {
    const topic = packet.topic;

    if (client) {
      if (topic === 'increment/volume') {
        sendToProcessIncrementVolume()
      } else if (topic === 'decrement/volume') {
        sendToProcessDecrementVolume()
      } else if (topic === 'toggle/volume') {
        sendToProcessDecrementVolume
        sendToProcessToggleVolume()
      }
    }
  });
}


const sendToProcessIncrementVolume = () => {
  AudioMonitor.incrementVolume();
  aedes.publish(
    {
      cmd: 'publish', // Команда публикации
      topic: 'response/increment/volume', // Топик публикации
      payload: Buffer.from('+ from backend'), // Сообщение должно быть в формате Buffer
      qos: 0, // Уровень качества обслуживания
      retain: false, // Флаг сохранения сообщения
      dup: false // Дублирование сообщения
    },
    (error) => {
      if (error) console.error('Ошибка публикации:', error);
    }
  );
};

const sendToProcessDecrementVolume = () => {
  AudioMonitor.decrementVolume()
  aedes.publish(
    {
      cmd: 'publish', // Команда публикации
      topic: 'response/increment/decrement', // Топик публикации
      payload: Buffer.from('- from backend'), // Сообщение должно быть в формате Buffer
      qos: 0, // Уровень качества обслуживания
      retain: false, // Флаг сохранения сообщения
      dup: false // Дублирование сообщения
    },
    (error) => {
      if (error) console.error('Ошибка публикации:', error);
    }
  );
}

const sendToProcessToggleVolume = () => {
  AudioMonitor.toggleMute()
}

const sendToClientsIncrementVolume = (defaultValue: IDevice) => {
  console.log('inc ', defaultValue.volume)
}

const sendToClientsDecrementVolume = (defaultValue: IDevice) => {
  console.log('dec ', defaultValue.volume)
}
