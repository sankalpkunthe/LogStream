const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 5000;

const sessions = new Map();

const messages = {
    INFO: ["Dashboard session successfully intialized",
        "Database connection benchmark: stable",
        "Background cache re-indexing completed",
        "Health check completed successfully",
        "Worker process completed successfully",
        "New system event processed"
    ],

    WARN: [
        "High system memory allocation detected",
        "Database response time is increasing",
        "CPU utilization approaching threshold",
        "Background queue contains pending jobs",
        "Cache miss rate is slightly elevated"
    ],

    ERROR: ["API metwork request failed with status 500",
        "Database query execution failed",
        "Background worker terminated unexpectedly",
        "Unable to connect to external service",
        "Request processing failed"
    ]
};

function generateLog() {
    const levels = ["INFO", "WARN", "ERROR"];

    const level = levels[Math.floor(Math.random()*levels.length)];

    const possibleMessages = messages[level];

    const message = possibleMessages[Math.floor(Math.random()*possibleMessages.length)];

    const now = new Date();

    const timestamp = now.toLocaleTimeString("en-GB", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second:"2-digit"
    }) + "." + String(now.getMilliseconds()).padStart(3, "0");

    return {
        level, timestamp, message, text: `[${level} ${timestamp} - ${message}]`
    };
}

app.get("/stream", (req, res) => {
    const clientId = req.query.clientId;

    if(!clientId) {
        return res.status(400).json({
            error: "clientId is required"
        });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    res.flushHeaders();

    console.log(`Client connected: ${clientId}`);

    if(sessions.has(clientId)) {
        clearInterval(sessions.get(clientId));
        sessions.delete(clientId);
    }

    const interval = setInterval(() => {
        const log = generateLog();

        res.write(`data: ${JSON.stringify(log)}\n\n`);
    }, 500);

    sessions.set(clientId, interval);

    req.on("close", () => {
        console.log(`Client disconnected: ${clientId}`);

        clearInterval(interval);
        sessions.delete(clientId);
        res.end();
    });  
});

app.get("/", (req, res) => {
    res.json({
        message: "LogStream backend is running"
    });
});

app.listen(PORT, () => {
    console.log(`LogStream server running on http://localhost:${PORT}`);
});