// Layout.js
import React from 'react';
import Chatbot from './Chatbot';
import FridgeIngredients from './FridgeIngredients';
import './Layout.css';

const Layout = () => {
  return (
    <div className="main-layout">
      <div className="chatbot-section">
        <Chatbot />
      </div>
      <div className="fridge-section">
        <FridgeIngredients />
      </div>
    </div>
  );
};

export default Layout;