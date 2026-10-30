module.exports = function(RED) {
    "use strict";

    function TrafficFlashNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        node.flashDuration = parseInt(config.flashDuration, 10);
        if (isNaN(node.flashDuration) || node.flashDuration < 50) {
            node.flashDuration = 500;
        }

        node.flashColor = config.flashColor || "green";
        node.flashShape = config.flashShape || "dot";
        node.idleState = config.idleState || "clear"; // "clear", "grey", "last"
        node.displayText = config.displayText || "none"; // "none", "count", "timestamp", "payload"

        let count = 0;
        let timer = null;
        let lastStatusText = "";

        function setIdleStatus() {
            if (node.idleState === "clear") {
                node.status({});
            } else if (node.idleState === "grey") {
                let text = "";
                if (node.displayText === "count") {
                    text = `${count} msg${count === 1 ? "" : "s"}`;
                } else if (node.displayText === "timestamp" || node.displayText === "payload") {
                    text = "idle";
                }
                node.status({ fill: "grey", shape: "ring", text: text });
            } else if (node.idleState === "last") {
                node.status({ fill: "grey", shape: "ring", text: lastStatusText });
            }
        }

        // Set initial idle state
        setIdleStatus();

        node.on("input", function(msg, send, done) {
            // Safe fallback for Node-RED 0.x
            send = send || function() { node.send.apply(node, arguments); };

            // Handle counter reset signal
            if (msg.reset === true || (typeof msg.topic === "string" && msg.topic.toLowerCase() === "reset")) {
                count = 0;
                lastStatusText = "";
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                }
                setIdleStatus();
                if (done) done();
                return;
            }

            count++;

            // Format status text based on selected mode
            let text = "";
            if (node.displayText === "count") {
                text = `${count} msg${count === 1 ? "" : "s"}`;
            } else if (node.displayText === "timestamp") {
                const now = new Date();
                text = now.toTimeString().split(" ")[0];
            } else if (node.displayText === "payload") {
                if (typeof msg.payload === "object" && msg.payload !== null) {
                    try {
                        text = JSON.stringify(msg.payload);
                    } catch (e) {
                        text = "[Object]";
                    }
                } else if (msg.payload !== undefined) {
                    text = String(msg.payload);
                } else {
                    text = "";
                }

                if (text.length > 20) {
                    text = text.substring(0, 17) + "...";
                }
            }

            lastStatusText = text;

            // Clear previous pending reset timer
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }

            // Flash active status
            node.status({ fill: node.flashColor, shape: node.flashShape, text: text });

            // Schedule idle return
            timer = setTimeout(function() {
                setIdleStatus();
                timer = null;
            }, node.flashDuration);

            // Forward message transparently
            send(msg);

            if (done) {
                done();
            }
        });

        node.on("close", function(removed, done) {
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
            node.status({});
            if (done) done();
        });
    }

    RED.nodes.registerType("traffic-flash", TrafficFlashNode);
};
