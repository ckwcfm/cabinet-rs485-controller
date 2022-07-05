const { listDevices, createSerialPort } = require('./serial')
const bufferReverse = require('buffer-reverse')

const COMMEND = Object.freeze({
  open: '8A',
  openMuliple: '90',
  read: '80',
})

// * decoders
const decodeOpenDoorFeedback = (buffer) => {
  const commend = buffer.slice(0, buffer.length - 1)
  const check = buffer.slice(buffer.length - 1).toString('hex')
  const cabinetHex = buffer.slice(1, 2)
  const doorHex = buffer.slice(2, 3)
  const statusHex = buffer.slice(3, 4)
  const checksum = getChecksum({ commend })
  console.log({
    buffer,
    length: buffer.length,
    commend,
    cabinetHex,
    doorHex,
    statusHex,
    check,
    checksum,
  })

  const cabinet = parseInt(cabinetHex.toString('hex'), 16)
  const door = parseInt(doorHex.toString('hex'), 16)
  const status = statusHex.toString('hex') === '11' ? 'success' : 'fail'
  return { cabinet, door, status }
}

// ! decodeOpenAllDoorOnCabinetFeedback not done yet
const decodeOpenAllDoorOnCabinetFeedback = (buffer) => {
  console.log({ buffer })
  return { success: true }
}

const decodeReadAllDoorOnCabinetFeekback = (buffer) => {
  const commend = buffer.slice(0, buffer.length - 1)
  const check = buffer.slice(buffer.length - 1).toString('hex')
  const cabinetHex = buffer.slice(1, 2)
  const statusHex = buffer.slice(3, 6)
  const checksum = getChecksum({ commend })

  console.log({
    buffer,
    length: buffer.length,
    commend,
    cabinetHex,
    statusHex,
    check,
    checksum,
  })

  const bits = parseInt(statusHex.toString('hex'), 16)
    .toString(2)
    .padStart(24, '0')
  const doors = bits
    .split('')
    .reverse()
    .reduce(
      (acc, val, index) => ({
        ...acc,
        [index + 1]: val === '1' ? 'open' : 'close',
      }),
      {}
    )
  const cabinet = parseInt(cabinetHex.toString('hex'), 16)
  return { cabinet, doors }
}

// * Helper Functions
const delay = async (millisec) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, millisec)
  })
}

const getChecksum = ({ commend }) => {
  const buffer = new Buffer.from(commend, 'hex')
  const arrByte = Uint8Array.from(buffer)
  const checksum = arrByte.reduce((acc, val) => {
    if (!acc) {
      return val
    }
    return acc ^ val
  }, null)
  return checksum.toString(16)
}

const createWriteBuffer = ({ commend }) => {
  const checksum = getChecksum({ commend })
  const buffer = new Buffer.from(`${commend}${checksum}`, 'hex')
  return buffer
}

const generateDoorsBuffer = ({ doors, reverse = false }) => {
  const bits = doors.map((door) => {
    const mask = 1 << (parseInt(door) - 1)
    return mask
  })
  const bitwise = bits.reduce((acc, val) => {
    return acc | val
  }, 0)
  const bitstring = bitwise.toString(2).padStart(24, '0')
  const hex = parseInt(bitstring, 2).toString(16).padStart(6, '0')
  const buffer = new Buffer.from(hex, 'hex')
  return reverse ? bufferReverse(buffer) : buffer
}

const parseHex = (value) => {
  const hex = parseInt(value).toString(16).padStart(2, '0')
  if (hex === NaN) {
    return ''
  }
  return hex
}

const preferDevices = Object.freeze([{ vendorId: '1a86', productId: '7523' }])

const startSerialPort = async () => {
  const list = await listDevices()
  const device = list.find((d) => {
    return !!preferDevices.find(
      (pd) => pd.vendorId === d.vendorId && pd.productId === d.productId
    )
  })
  if (!device) {
    return
  }
  const { serialPort } = createSerialPort(device)
  return { serialPort }
}

module.exports = {
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
}
