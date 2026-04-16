const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

let system = {
    power: true,
    currentLine: "Line 1",
    runtime: 0,
    flow: "NORMAL",
    soil: "NORMAL",

    selectedMotor: null,
    activePipe: null,

    motors: [],
    pipes: [],

    alerts: [],
    notifications: [],

    analytics: {
        totalRuntime: 0,
        motorStarts: 0,
        waterUsage: 0
    },

    autoTimer: 0
};

// Runtime + countdown
setInterval(() => {
    if (system.selectedMotor !== null &&
        system.motors[system.selectedMotor]?.running) {

        system.runtime++;
        system.analytics.totalRuntime++;
        system.analytics.waterUsage += 0.5;

        if (system.autoTimer > 0) {
            system.autoTimer--;
            if (system.autoTimer === 0) {
                system.motors[system.selectedMotor].running = false;
                system.notifications.push("⏱ Auto irrigation completed");
            }
        }
    }
}, 1000);

// Power
let lastPower = true;
setInterval(() => {
    system.power = Math.random() > 0.3;

    if (lastPower && !system.power) {
        system.notifications.push("⚡ Power lost!");
    }
    if (!lastPower && system.power) {
        system.notifications.push("⚡ Power restored!");
    }

    lastPower = system.power;

    const lines = ["Line 1", "Line 2", "Line 3"];
    system.currentLine = lines[Math.floor(Math.random() * 3)];
}, 5000);

// Flow
setInterval(() => {
    system.flow = Math.random() > 0.7 ? "LOW" : "NORMAL";

    if (system.flow === "LOW") {
        system.alerts.push("⚠ Low Water Flow");
    }
}, 4000);

// Soil
setInterval(() => {
    const s = ["DRY","NORMAL","WET"];
    system.soil = s[Math.floor(Math.random()*3)];

    if(system.soil === "DRY"){
        system.notifications.push("🌱 Soil is dry");
    }
}, 6000);

// APIs
app.get("/status", (req, res) => res.json(system));

app.post("/addPipe", (req, res) => {
    system.pipes.push({ name: req.body.name, lastRun: "Never" });
    res.json({ message: "Pipe added" });
});

app.post("/addMotor", (req, res) => {
    system.motors.push({
        name: req.body.name,
        requiredLine: req.body.line,
        pipes: req.body.pipes,
        running: false
    });
    res.json({ message: "Motor added" });
});

app.post("/selectMotor", (req, res) => {
    system.selectedMotor = Number(req.body.index);
    system.runtime = 0;
    res.json({});
});

app.post("/motor/start", (req, res) => {

    if(system.selectedMotor === null){
    return res.json({ error:"Select motor first" });
    }

    let m = system.motors[system.selectedMotor];

    if (!system.power) return res.json({ error:"No power" });

    if (m.requiredLine !== system.currentLine)
        return res.json({ error:"Wrong line" });

    if (system.flow === "LOW")
        return res.json({ error:"Low water flow" });

    m.running = true;
    system.analytics.motorStarts++;
    system.runtime = 0;

    if(m.pipes.length>0){
        system.activePipe = m.pipes[0];
    }

    res.json({});
});

app.post("/motor/stop", (req, res) => {
    if(system.selectedMotor!==null){
        system.motors[system.selectedMotor].running=false;
        system.activePipe=null;
    }
    res.json({});
});

app.post("/auto", (req, res) => {
    system.selectedMotor = Number(req.body.motor);
    system.autoTimer = Number(req.body.time);
    system.activePipe = Number(req.body.pipe);

    if(system.motors[system.selectedMotor]){
        system.motors[system.selectedMotor].running = true;
    }

    res.json({});
});

app.listen(3000,()=>console.log("Server running"));