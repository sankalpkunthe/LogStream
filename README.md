# LogStream

LogStream is a simple real-time developer observability dashboard that works like a live terminal. It streams system logs from the backend to the frontend using **Server-Sent Events (SSE)**.

## Features

- Real-time log streaming every 500ms
- INFO, WARN and ERROR logs
- Start / Stop stream controls
- Separate client sessions
- Automatic cleanup when a client disconnects
- Keeps only the latest 100 logs
- Filter logs by level
- Download session logs as `logs.txt`

## Tech Stack

- React (frontend)
- Node.js (backend)
- Express (backend)
- Server-Sent Events (SSE)
