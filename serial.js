const { SerialPort } = require('serialport')
const eventEmitter = require('events').EventEmitter
const emitter = new eventEmitter()

const EVENT = Object.freeze({
  LIST_UPDATED: 'listUpdated',
})

let listedDevices = []
setInterval(async () => {
  const devices = await SerialPort.list()
  if (listedDevices.length !== devices.length) {
    emitter.emit(EVENT.LIST_UPDATED, devices)
  }
  listedDevices = [...devices]
}, 1000)

const createSerialPort = ({ path, baudRate = 9600 }) => {
  console.log(`create connection to ${path} at baudRate ${baudRate}`)
  const serialPort = new SerialPort({
    path,
    baudRate,
    autoOpen: false,
  })

  serialPort.on('error', (error) => {
    console.log('error connecting', error)
  })

  return { serialPort }
}

module.exports = {
  listDevices: SerialPort.list,
  createSerialPort,
  EVENT,
  emitter: emitter,
}
