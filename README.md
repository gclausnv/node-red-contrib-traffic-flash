# node-red-contrib-traffic-flash

A lightweight visual indicator node for [Node-RED](https://nodered.org) that blinks/flashes whenever data passes through it.

Drop it anywhere along a wire to verify message flow, check throughput, or debug timing without cluttering the debug sidebar or spamming logs.

---

## Features

- **Zero-Mutation Pass-Through**: Forwards `msg` instantly and untouched.
- **Visual Pulse**: Lights up the node status indicator on every message.
- **Configurable Pulse Duration**: Set how long the indicator stays active (e.g. 100ms, 500ms, 1000ms).
- **Status Text Options**:
  - **None**: Just the blinking light.
  - **Message Count**: Displays cumulative messages received (e.g., `1 msg`, `42 msgs`).
  - **Timestamp**: Displays the time of the latest message (`HH:MM:SS`).
  - **Payload Preview**: Compact inline preview of `msg.payload`.
- **Idle Modes**:
  - **Clear**: Status indicator completely vanishes when idle.
  - **Grey Ring**: Dim grey outline indicating the line is armed and awaiting traffic.
  - **Keep Last**: Dim grey outline retaining the last counter or payload value.
- **Reset Capability**: Send `msg.reset = true` or `msg.topic = 'reset'` to zero out the counter and restore idle status.

---

## Installation

### Via Node-RED Editor (Recommended)
1. Open your Node-RED editor.
2. Go to the top right menu **☰** &rarr; **Manage palette**.
3. Select the **Install** tab.
4. Search for `node-red-contrib-traffic-flash` and click **install**.

### Via Terminal / Command Line
Inside your Node-RED user directory (typically `~/.node-red`):

```bash
cd ~/.node-red
npm install node-red-contrib-traffic-flash
```

Then restart Node-RED.

---

## Configuration

| Property | Default | Description |
| :--- | :--- | :--- |
| **Flash Color** | Green | Color while active (`green`, `yellow`, `blue`, `red`, `grey`). |
| **Flash Shape** | Dot | Indicator shape (`dot` solid or `ring` outline). |
| **Duration (ms)** | 500 | How long the active flash persists after receiving a message. |
| **Status Text** | None | Text displayed beside the indicator (`none`, `count`, `timestamp`, `payload`). |
| **Idle State** | Clear | Appearance when traffic pauses (`clear`, `grey` ring, `last` ring). |

---

## Example Flow

Copy the following JSON and import it into Node-RED (**☰** &rarr; **Import** &rarr; **Clipboard**):

```json
[
  {
    "id": "inject_traffic",
    "type": "inject",
    "z": "tab1",
    "name": "Simulate Sensor Tick",
    "props": [{"p": "payload"}],
    "repeat": "1",
    "crontab": "",
    "once": true,
    "onceDelay": 0.1,
    "topic": "",
    "payload": "heartbeat",
    "payloadType": "str",
    "x": 160,
    "y": 120,
    "wires": [["traffic_flash_node"]]
  },
  {
    "id": "traffic_flash_node",
    "type": "traffic-flash",
    "z": "tab1",
    "name": "Traffic Tap",
    "flashDuration": 300,
    "flashColor": "green",
    "flashShape": "dot",
    "idleState": "grey",
    "displayText": "count",
    "x": 380,
    "y": 120,
    "wires": [["debug_out"]]
  },
  {
    "id": "debug_out",
    "type": "debug",
    "z": "tab1",
    "name": "Output",
    "active": false,
    "tosidebar": true,
    "console": false,
    "tostatus": false,
    "complete": "payload",
    "targetType": "msg",
    "statusVal": "",
    "statusType": "auto",
    "x": 560,
    "y": 120,
    "wires": []
  }
]
```

---

## License

[MIT](LICENSE) &copy; Greg Clauson
