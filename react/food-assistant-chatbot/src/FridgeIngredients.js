import React, { useState, useEffect } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import axios from 'axios';
import './FridgeIngredients.css';

const FridgeIngredients = () => {
  const [foodData, setFoodData] = useState({
    foods: [],
    sorted_soon_expired_foods: [],
    sorted_good_foods: [],
    sorted_expired_foods: [],
    total_count: 0,
    expired_count: 0,
    expiring_soon_count: 0,
    good_count: 0
  });
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
      const response = await axios.get('http://localhost:5000/api/foods/foodStatus');
      setFoodData(response.data);
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

  const StatusBadge = ({ status }) => {
    const config = {
      expired: { 
        icon: AlertCircle, 
        color: 'text-red-600 bg-red-100', 
        text: 'Expired' 
      },
      expiring_soon: { 
        icon: AlertTriangle, 
        color: 'text-yellow-600 bg-yellow-100', 
        text: 'Expiring Soon' 
      },
      good: { 
        icon: CheckCircle, 
        color: 'text-green-600 bg-green-100', 
        text: 'Good' 
      }
    };
    
    const { icon: Icon, color, text } = config[status] || config.good;
    
    return (
      <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${color}`}>
        <Icon size={16} />
        <span className="text-sm font-medium">{text}</span>
      </div>
    );
  };

  return (
    <div className="fridge-container">
      <div className="fridge-header">
        <h2>Fridge Ingredients</h2>
        <div className="flex gap-4 mb-4">
          <div className="text-sm">
            Total: {foodData.total_count}
          </div>
          <div className="text-sm text-red-600">
            Expired: {foodData.expired_count}
          </div>
          <div className="text-sm text-yellow-600">
            Expiring Soon: {foodData.expiring_soon_count}
          </div>
          <div className="text-sm text-green-600">
            Good: {foodData.good_count}
          </div>
        </div>
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

      <div className="space-y-6">
        {foodData.sorted_expired_foods.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-red-600 mb-2">Expired Items</h3>
            <div className="ingredients-list">
              {foodData.sorted_expired_foods.map((ingredient) => (
                <div key={ingredient._id} className="ingredient-card border-red-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold">{ingredient.name}</h3>
                    <StatusBadge status={ingredient.status} />
                  </div>
                  <p>Expires: {new Date(ingredient.expiration_date).toLocaleDateString()}</p>
                  <p>Days until expiration: {ingredient.days_until_expiration}</p>
                  <p>Quantity: {ingredient.quantity}</p>
                  <p>Weight: {ingredient.weight}g</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {foodData.sorted_soon_expired_foods.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-yellow-600 mb-2">Expiring Soon</h3>
            <div className="ingredients-list">
              {foodData.sorted_soon_expired_foods.map((ingredient) => (
                <div key={ingredient._id} className="ingredient-card border-yellow-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold">{ingredient.name}</h3>
                    <StatusBadge status={ingredient.status} />
                  </div>
                  <p>Expires: {new Date(ingredient.expiration_date).toLocaleDateString()}</p>
                  <p>Days until expiration: {ingredient.days_until_expiration}</p>
                  <p>Quantity: {ingredient.quantity}</p>
                  <p>Weight: {ingredient.weight}g</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {foodData.sorted_good_foods.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-green-600 mb-2">Good Condition</h3>
            <div className="ingredients-list">
              {foodData.sorted_good_foods.map((ingredient) => (
                <div key={ingredient._id} className="ingredient-card border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold">{ingredient.name}</h3>
                    <StatusBadge status={ingredient.status} />
                  </div>
                  <p>Expires: {new Date(ingredient.expiration_date).toLocaleDateString()}</p>
                  <p>Days until expiration: {ingredient.days_until_expiration}</p>
                  <p>Quantity: {ingredient.quantity}</p>
                  <p>Weight: {ingredient.weight}g</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FridgeIngredients;