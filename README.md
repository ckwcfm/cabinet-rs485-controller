# cabinet-rs-485-controller

this controller make it easy to use this kind of rs485 controller board. You don't need to handle buffer cammand anymore

![IMG_3701](https://user-images.githubusercontent.com/12065545/177164737-093edaf3-299b-40c7-a597-dc3012142188.JPG)

# Installation

```
npm install cabinet-rs-485-controller
```

# Usage

```javascript
const cabinetManager = require('cabinet-rs-485-controller')

const cabinet = 1
const doors = [1, 2, 6]
await cabinetManager.openDoors({ cabinet, doors })

const status = await cabinetManager.readAllDoorsOnCabinet({ cabinet })
```

cabinetManager will try to find the usb serial port. You can also use `connect()` to connect to your serical port

```javascript
const cabinetManager = require('cabinet-rs-485-controller')

const devices = await cabinetManager.listDevices()
const { path } = devices[0]
cabinetManager.connect({ path })
```

# Api

list serial port devices connected to your computer

```javascript
const devices = await cabinetManager.listDevices()
```

connect to serial port device

```javascript
await cabinetManager.connect({ path })
```

open one door on specific cabinet

```javascript
const { status } = await cabinetManager.openDoor({ cabinet: 1, door: 1 })
```

open multiple doors on specific cabinet

```javascript
const feedback = await cabinetManager.openDoors({
  cabinet: 1,
  doors: [1, 2, 9],
})
```

open all door on specific cabinet

```javascript
const feedback = await cabinetManager.openAllDoorsOnCabinet({ cabinet: 1 })
```

open all door on all cabinets

```javascript
await cabinetManager.openAllDoors({ cabinet: 1 })
```

read all doors's status on specific cabinet

```javascript
const { cabinet, doors } = await cabinetManager.readAllDoorsOnCabinet({
  cabinet: 1,
})
```
