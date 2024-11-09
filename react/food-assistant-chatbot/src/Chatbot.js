import React, { useState } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import './Chatbot.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  // Function to handle sending a message
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { id: uuidv4(), sender: 'user', text: input };
    setMessages([...messages, userMessage]);

    try {
      const response = await axios.post('http://localhost:5000/api/recommend', { query: input });
      const botMessage = { id: uuidv4(), sender: 'bot', text: response.data.response };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      const errorMessage = { id: uuidv4(), sender: 'bot', text: 'Sorry, I couldn\'t process your request.' };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }

    setInput(''); // Clear input field after sending
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`chatbot-message ${msg.sender}`}>
            <p>{msg.text}</p>
          </div>
        ))}
      </div>

      <div className="chatbot-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask for a food recommendation..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chatbot;
