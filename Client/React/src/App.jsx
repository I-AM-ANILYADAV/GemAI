import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [question, setQuestion] = useState("");
  const [responses, setResponses] = useState([]);
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  // Initialize speech recognition
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = "en-US";

  // Start listening when mic is clicked
  const handleMicClick = () => {
    setListening(true);
    recognition.start();
  };

  // Handle speech recognition result
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    setQuestion(transcript);
    setListening(false);
    alert(`You said: "${transcript}"`);
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error", event.error);
    setError("Speech recognition error, please try again.");
    setListening(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await axios.post("http://localhost:8080/generate", {
        prompt: question,
      });
      setResponses((prevResponses) => [...prevResponses, res.data]);
      setQuestion("");
    } catch (error) {
      console.error("Error fetching response:", error);
      setResponses((prevResponses) => [
        ...prevResponses,
        "Error fetching response from the server.",
      ]);
      setError("Failed to fetch response. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearResponses = () => {
    setResponses([]);
    setError("");
  };

  const handleResetQuestion = () => {
    setQuestion("");
  };

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  const handleDownloadResponses = () => {
    const blob = new Blob([responses.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "responses.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`full-container ${darkMode ? "dark-mode" : ""}`}>
      <div className="App">
        <h1>Ask the GemAI</h1>
        <button onClick={toggleDarkMode} className="toggle-mode-button">
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
        <form onSubmit={handleSubmit} className="question-form">
          <div className="input-mic-container">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter your prompt..."
              className="question-input"
              disabled={loading}
            />
            <button
              type="button"
              onClick={handleMicClick}
              className="mic-button"
              disabled={listening || loading}
            >
              🎤 {listening ? "Listening..." : "Mic"}
            </button>
          </div>
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Loading..." : "Submit"}
          </button>
        </form>
        {error && <p className="error-message">{error}</p>}
        <div className="button-container">
          <button onClick={handleClearResponses} className="action-button">
            Clear Responses
          </button>
          <button onClick={handleResetQuestion} className="action-button">
            Reset Question
          </button>
          <button onClick={handleDownloadResponses} className="action-button">
            Download Responses
          </button>
        </div>
        <div className="response">
  {responses.length > 0 && (
    <div>
      {responses.map((resp, index) => (
        <p key={index} className="response-text">
          {resp}
        </p>
      ))}
    </div>
  )}
</div>

      </div>
    </div>
  );
}

export default App;
