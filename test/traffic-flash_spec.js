const should = require("should");
const helper = require("node-red-node-test-helper");
const trafficFlashNode = require("../traffic-flash.js");

helper.init(require.resolve("node-red"));

describe("traffic-flash Node", function() {

    beforeEach(function(done) {
        helper.startServer(done);
    });

    afterEach(function(done) {
        helper.unload().then(function() {
            helper.stopServer(done);
        });
    });

    it("should be loaded into runtime", function(done) {
        const flow = [{ id: "n1", type: "traffic-flash", name: "test-flash" }];
        helper.load(trafficFlashNode, flow, function() {
            const n1 = helper.getNode("n1");
            n1.should.have.property("name", "test-flash");
            done();
        });
    });

    it("should pass messages through completely unmodified", function(done) {
        const flow = [
            { id: "n1", type: "traffic-flash", name: "traffic", wires: [["n2"]] },
            { id: "n2", type: "helper" }
        ];
        helper.load(trafficFlashNode, flow, function() {
            const n1 = helper.getNode("n1");
            const n2 = helper.getNode("n2");

            n2.on("input", function(msg) {
                msg.should.have.property("payload", "hello world");
                msg.should.have.property("customHeader", 42);
                done();
            });

            n1.receive({ payload: "hello world", customHeader: 42 });
        });
    });

    it("should flash status indicator on incoming traffic", function(done) {
        const flow = [
            {
                id: "n1",
                type: "traffic-flash",
                flashColor: "blue",
                flashShape: "ring",
                flashDuration: 200,
                displayText: "count",
                wires: [["n2"]]
            },
            { id: "n2", type: "helper" }
        ];

        helper.load(trafficFlashNode, flow, function() {
            const n1 = helper.getNode("n1");

            let statusCalls = [];
            const origStatus = n1.status.bind(n1);
            n1.status = function(st) {
                statusCalls.push(st);
                origStatus(st);
            };

            n1.receive({ payload: "first message" });

            setTimeout(function() {
                // Should have recorded active flash
                const activeCall = statusCalls.find(s => s.fill === "blue" && s.shape === "ring" && s.text === "1 msg");
                should.exist(activeCall);
                done();
            }, 50);
        });
    });

    it("should handle reset signal and not forward reset message", function(done) {
        const flow = [
            { id: "n1", type: "traffic-flash", wires: [["n2"]] },
            { id: "n2", type: "helper" }
        ];

        helper.load(trafficFlashNode, flow, function() {
            const n1 = helper.getNode("n1");
            const n2 = helper.getNode("n2");

            n2.on("input", function() {
                done(new Error("Reset message should not have been forwarded"));
            });

            n1.receive({ reset: true });

            setTimeout(function() {
                done();
            }, 100);
        });
    });

    it("should return to idle state after flashDuration", function(done) {
        const flow = [
            {
                id: "n1",
                type: "traffic-flash",
                flashDuration: 100,
                idleState: "grey",
                displayText: "count",
                wires: [["n2"]]
            },
            { id: "n2", type: "helper" }
        ];

        helper.load(trafficFlashNode, flow, function() {
            const n1 = helper.getNode("n1");
            let lastStatus = null;
            n1.status = function(st) {
                lastStatus = st;
            };

            n1.receive({ payload: "ping" });

            setTimeout(function() {
                // After 150ms (> 100ms duration), should have reverted to grey ring
                should.exist(lastStatus);
                lastStatus.should.have.property("fill", "grey");
                lastStatus.should.have.property("shape", "ring");
                lastStatus.should.have.property("text", "1 msg");
                done();
            }, 150);
        });
    });
});
