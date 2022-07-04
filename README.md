# cabinet-rs-485-controller

this controller make it easy to use this kind of rs485 controller board. You don't need to handle buffer cammand anymore

![IMG_3701](https://user-images.githubusercontent.com/12065545/177164737-093edaf3-299b-40c7-a597-dc3012142188.JPG)

# Installation

```
npm install cabinet-rs-485-controller
```

# Usage

```javascript
const cabinetManager = require('../../managers/cabinet-manager')

const cabinet = 1
const doors = [1, 2, 6]
await cabinetManager.openDoors({ cabinet, doors })

const status = await cabinetManager.readAllDoorsOnCabinet({ cabinet })
```

cabinetManager will try to find the usb serial port. You can also use `connect()` to connect to your serical port

```javascript
const cabinetManager = require('../../managers/cabinet-manager')

const devices = await cabinetManager.listDevices()
const device = devices[0]
cabinetManager.connect(device)
```
