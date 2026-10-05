import { useEffect, useRef, useState } from "react";
import "./index.css";

const MAX_LOGS = 100;

function App() {
  const [clientId, setClientId] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState("ALL");

  const eventSourceRef = useRef(null);

  const startStream = () => {
    if(!clientId.trim()) {
      alert("Please enter the client ID");
      return;
    }

    if(eventSourceRef.current) return;

  const url = `http://localhost:5000/stream?clientId=` + encodeURIComponent(clientId.trim());

  const eventSource = new EventSource(url);

  eventSource.onopen = () => {
    console.log("SSE connection established.");

    setIsStreaming(true);
  };

  eventSource.onmessage = (event) => {
    const log = JSON.parse(event.data);

    setLogs((previousLogs) => {
      const updatedLogs = [...previousLogs, log];

      return updatedLogs.slice(-MAX_LOGS);
    });
  };

  eventSource.onerror = (error) => {
    console.error("SSE connection error:", error);

    eventSource.close();
    eventSourceRef.current = null;

    setIsStreaming(false);
  };

  eventSourceRef.current = eventSource;
};

const stopStream = () => {
  if(eventSourceRef.current) {
    eventSourceRef.current.close();
    eventSourceRef.current = null;
  }

  setIsStreaming(false);
};

useEffect(() => {
  return () => {
    if(eventSourceRef.current) {
      eventSourceRef.current.close();
    }
  };
}, []);

const filteredLogs = filter === "ALL" ? logs : logs.filter((log) => log.level === filter);

const downloadLogs = () => {
  if(logs.length ===0) {
    alert("No logs to save");
    return;
  }

  const content = logs.map((log) => log.text).join("\n");

  const blob = new Blob([content], {type: "text/plain"});

  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = "logs.txt";

  anchor.click();

  URL.revokeObjectURL(url);
};

 return (
        <div className="app">

            <header className="header">
                <div>
                    <h1>LogStream</h1>
                    <p>Developers Observing Dashboard</p>
                </div>

                <div className={`status ${isStreaming ? "live" : ""}`}>
                    <span className="status-dot"></span>
                    {isStreaming ? "LIVE" : "STOPPED"}
                </div>
            </header>

            <main>

                <section className="control-panel">

                    <div className="input-group">
                        <label htmlFor="clientId">
                            Client ID
                        </label>

                        <input
                            id="clientId"
                            type="text"
                            placeholder="Enter client name"
                            value={clientId}
                            onChange={(event) =>
                                setClientId(event.target.value)
                            }
                            disabled={isStreaming}
                        />
                    </div>

                    <div className="controls">

                        <button
                            className="start-button"
                            onClick={startStream}
                            disabled={isStreaming}
                        >
                          Start Stream
                        </button>

                        <button
                            className="stop-button"
                            onClick={stopStream}
                            disabled={!isStreaming}
                        >
                          Stop Stream
                        </button>

                    </div>

                </section>

                <section className="toolbar">

                    <div>
                        <label htmlFor="filter">
                            Log Filter
                        </label>

                        <select
                            id="filter"
                            value={filter}
                            onChange={(event) =>
                                setFilter(event.target.value)
                            }
                        >
                            <option value="ALL">
                                All Logs
                            </option>

                            <option value="INFO">
                                Info Only
                            </option>

                            <option value="WARN">
                                Warnings Only
                            </option>

                            <option value="ERROR">
                                Errors Only
                            </option>
                        </select>
                    </div>

                    <button
                        className="download-button"
                        onClick={downloadLogs}
                    >
                      Download Session Output
                    </button>

                </section>

                <section className="terminal-container">

                    <div className="terminal-header">
                        <div className="terminal-buttons">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>

                        <span className="terminal-title">
                            logstream terminal
                        </span>

                        <span className="log-count">
                            {filteredLogs.length} logs
                        </span>
                    </div>

                    <div className="terminal">

                        {filteredLogs.length === 0 ? (
                            <div className="empty-terminal">
                                <span>
                                    {isStreaming
                                        ? "Waiting for incoming logs..."
                                        : "Stream stopped. Press Start Stream to begin."}
                                </span>
                            </div>
                        ) : (
                            filteredLogs.map((log, index) => (
                                <div
                                    className={`log-line ${log.level.toLowerCase()}`}
                                    key={`${log.timestamp}-${index}`}
                                >
                                    <span className="level">
                                        [{log.level}]
                                    </span>

                                    <span className="timestamp">
                                        {log.timestamp}
                                    </span>

                                    <span className="message">
                                        - {log.message}
                                    </span>
                                </div>
                            ))
                        )}

                    </div>

                </section>

            </main>

        </div>
    );
}

export default App;