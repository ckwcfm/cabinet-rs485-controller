const { createSerialPort, EVENT, emitter } = require('./serial')
const eventEmitter = require('events').EventEmitter
const deviceEmitter = new eventEmitter()
const {
  COMMEND,
  startSerialPort,
  parseHex,
  generateDoorsBuffer,
  createWriteBuffer,
  getChecksum,
  delay,
  decodeOpenAllDoorOnCabinetFeedback,
  decodeOpenDoorFeedback,
  decodeReadAllDoorOnCabinetFeekback,
} = require('./cabinet-manager-util')

// * CabnetManager
function CabinetManager() {
  this.deviceEmitter = deviceEmitter

  const connect = async () => {
    try {
      const { serialPort } = (await startSerialPort()) || {}
      this.serialPort = serialPort
      if (!serialPort) {
        return
      }
      this.serialPort.on('data', (data) => {
        deviceEmitter.emit('data', data)
        this.serialPort.flush()
      })
    } catch (error) {
      console.error(error)
    }
  }

  connect()

  emitter.on(EVENT.LIST_UPDATED, async (devices) => {
    console.log({ emit: devices })
    connect()
  })
}

CabinetManager.prototype.listDevices = async function () {
  return await this.serialPort.listDevices()
}

CabinetManager.prototype.disconnect = async function () {
  return new Promise((resolve, reject) => {
    if (!this.serialPort) {
      return reject('no serial port')
    }
    if (!this.serialPort.isOpen) {
      return resolve('closed')
    }
    this.serialPort.close(function (error) {
      if (error) {
        return reject(error)
      }
      resolve('closed')
    })
  })
}

CabinetManager.prototype.connect = async function ({ path }) {
  try {
    await this.disconnect()
    const { serialPort } = createSerialPort({ path })
    this.serialPort = serialPort
  } catch (error) {
    throw error
  }
}

CabinetManager.prototype.openPort = async function () {
  return new Promise((resolve, reject) => {
    if (this.serialPort.isOpen) {
      console.log('port is already opened')
      resolve('port is opened')
    }
    this.serialPort.open((error) => {
      if (error) {
        return reject(error)
      }
      console.log('opened port')
      return resolve('opened Port')
    })
  })
}

CabinetManager.prototype.write = async function (data, ignoreFeedback = false) {
  return new Promise(async (resolve, reject) => {
    if (!this.serialPort) {
      return reject('no serial port')
    }
    await this.openPort()
    console.log('opened', `writing data ${data.toString('hex')}`)
    this.serialPort.write(data, (error) => {
      if (error) {
        console.log(`error ${error}`)
        return reject(error)
      }
      if (ignoreFeedback) {
        return resolve('')
      }
      this.serialPort.flush()
      this.serialPort.prependOnceListener('data', (data) => {
        console.log(`on wirte ${data.toString('hex')}`)
        return resolve(data)
      })
    })
  })
}

CabinetManager.prototype.openDoor = async function ({ cabinet, door }) {
  try {
    const doorHex = parseHex(door)
    const cabinetHex = parseHex(cabinet)
    const commend = `${COMMEND.open}${cabinetHex}${doorHex}11`
    const buffer = createWriteBuffer({ commend })
    // todo; send to buffer
    const feedback = await this.write(buffer)
    const { status } = decodeOpenDoorFeedback(feedback)
    return { status }
  } catch (error) {
    throw error
  }
}

CabinetManager.prototype.openDoors = async function ({ cabinet, doors }) {
  try {
    console.log({ cabinet, doors })
    if (doors.length === 0) {
      return
    }
    const uniqDoors = [...new Set(doors)]
    const doorsHex = generateDoorsBuffer({
      doors: uniqDoors,
      reverse: true,
    }).toString('hex')
    const cabinetHex = parseHex(cabinet)
    const commend = `${COMMEND.openMuliple}${cabinetHex}${doorsHex}00`
    const buffer = createWriteBuffer({ commend })
    const feedback = await this.write(buffer)
    console.log({ openMulipleFeedBack: feedback })
    await delay(100)
    return feedback
  } catch (error) {
    throw error
  }
}

CabinetManager.prototype.openAllDoorsOnCabinet = async function ({
  cabinet,
  ignoreFeedback = false,
}) {
  try {
    console.log(`open all doors on cabinet ${cabinet}`)
    const cabinetHex = parseHex(cabinet)
    const commend = `${COMMEND.open}${cabinetHex}0011`
    const buffer = createWriteBuffer({ commend })
    const feedback = await this.write(buffer, ignoreFeedback)
    console.log('feedback', feedback.toString('hex'))
    const status = decodeOpenAllDoorOnCabinetFeedback(feedback)
    await delay(100)
    return status
  } catch (error) {
    throw error
  }
}

CabinetManager.prototype.openAllDoors = async function () {
  try {
    const doors = Array(32).fill(1)
    for (const [index, _] of doors.entries()) {
      await this.openAllDoorsOnCabinet({
        cabinet: index + 1,
        ignoreFeedback: true,
      })
      console.log('open next door')
    }
  } catch (error) {
    throw error
  }
}

CabinetManager.prototype.readAllDoorsOnCabinet = async function ({ cabinet }) {
  try {
    const cabinetHex = parseHex(cabinet)
    const commend = `${COMMEND.read}${cabinetHex}0033`
    const buffer = createWriteBuffer({ commend })
    const feedback = await this.write(buffer)
    const status = decodeReadAllDoorOnCabinetFeekback(feedback)
    return status
  } catch (error) {
    throw error
  }
}

module.exports = new CabinetManager()
