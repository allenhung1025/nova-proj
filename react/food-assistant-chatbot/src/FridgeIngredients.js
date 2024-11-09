// FridgeIngredients.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FridgeIngredients.css';

const FridgeIngredients = () => {
  const [ingredients, setIngredients] = useState([]);
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    expiration_date: '',
    quantity: 1,
    weight: 0,
    is_fridge: true
  });
  const [isFormVisible, setIsFormVisible] = useState(false);

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/foods?is_fridge=true');
      setIngredients(response.data.foods);
    } catch (error) {
      console.error('Error fetching ingredients:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewIngredient(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'weight' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/addFood', newIngredient);
      fetchIngredients();
      setNewIngredient({
        name: '',
        expiration_date: '',
        quantity: 1,
        weight: 0,
        is_fridge: true
      });
      setIsFormVisible(false);
    } catch (error) {
      console.error('Error adding ingredient:', error);
    }
  };

  return (
    <div className="fridge-container">
      <div className="fridge-header">
        <h2>Fridge Ingredients</h2>
        <button 
          className="add-ingredient-btn"
          onClick={() => setIsFormVisible(!isFormVisible)}
        >
          {isFormVisible ? 'Cancel' : 'Add Ingredient'}
        </button>
      </div>

      {isFormVisible && (
        <form onSubmit={handleSubmit} className="ingredient-form">
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={newIngredient.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Expiration Date:</label>
            <input
              type="date"
              name="expiration_date"
              value={newIngredient.expiration_date}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Quantity:</label>
            <input
              type="number"
              name="quantity"
              min="1"
              value={newIngredient.quantity}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Weight (g):</label>
            <input
              type="number"
              name="weight"
              min="0"
              step="0.1"
              value={newIngredient.weight}
              onChange={handleInputChange}
              required
            />
          </div>
          <button type="submit" className="submit-btn">Add to Fridge</button>
        </form>
      )}

      <div className="ingredients-list">
        {ingredients.map((ingredient) => (
          <div key={ingredient._id} className="ingredient-card">
            <h3>{ingredient.name}</h3>
            <p>Expires: {new Date(ingredient.expiration_date).toLocaleDateString()}</p>
            <p>Quantity: {ingredient.quantity}</p>
            <p>Weight: {ingredient.weight}g</p>
          </div>
        ))}
      </div>
    </div>
  );
};
export default FridgeIngredients;