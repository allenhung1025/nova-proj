from dotenv import load_dotenv
import os
from flask import Flask, request, jsonify, make_response, Response
from flask_cors import CORS
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict
from pymongo import MongoClient
from pymongo.collection import Collection
from bson import ObjectId
from openai import OpenAI
from flask_pymongo import PyMongo
from werkzeug.local import LocalProxy
from flask import current_app




class Food(BaseModel):
    name: str
    expiration_date: str
    quantity: int = Field(gt=0)
    weight: float = Field(gt=0)  # in grams
    is_fridge: bool


def example_chat( user_query: str, model_name: str, stream: bool = True):
    """
    Examples of chat completions from the proxy
    """
    client = OpenAI(
        api_key="sk-Vmiqil4adpg7ZmiUZ9Bnng", # set this!!!
        base_url="https://nova-litellm-proxy.onrender.com" # and this!!!
    )

    response = client.chat.completions.create(
        model=model_name,
        messages = [
            {
                "role": "user",
                "content": f"{user_query}"
            }
        ],
        stream=stream
    )
    return response.choices[0].message.content

app = Flask(__name__)
CORS(app)  # Enable CORS to allow React frontend to access
load_dotenv()
app.secret_key = os.getenv("FLASK_SECRET_KEY")
MONGO_DB_URI = os.getenv("MONGO_DB_URI")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME")

app.config["MONGO_URI"] = (
    f"{MONGO_DB_URI}/{MONGO_DB_NAME}?authSource=admin&authMechanism=DEFAULT"
)
def get_mongodb() -> PyMongo:
    return PyMongo(current_app).db


# Use LocalProxy to read the global mongo_db instance with just `mongo_db`
mongo_db = LocalProxy(get_mongodb)


@app.route('/api/recommend', methods=['POST'])
def recommend_food():
    data = request.get_json()
    user_query = data.get("query", "").lower()

    # Simple food recommendation logic based on the user query
    # if "breakfast" in user_query:
    #     response_text = "How about trying some oatmeal with fresh berries?"
    # elif "lunch" in user_query:
    #     response_text = "A nice quinoa salad with grilled chicken sounds great!"
    # elif "dinner" in user_query:
    #     response_text = "How about pasta with a side of roasted vegetables?"
    # else:
    #     response_text = "I'm here to help! Could you specify if it's breakfast, lunch, or dinner?"

    response_text = example_chat(user_query, "anthropic/claude-3-5-sonnet-20241022", False)
    return jsonify({"response": response_text})

@app.route("/api/addFood", methods=["POST"])
def addFood() -> Response:
    try:
        raw_food = request.json
        raw_food["created_at"] = datetime.now()
        food = Food(**raw_food)
    except ValidationError:
        return make_response({"message": "Invalid input."}, 400)
    mongo_db.food.insert_one(food.model_dump())
    return make_response({f"message": "New data ({name}) added."}, 200)



@app.route("/api/foods", methods=["GET"])
def getFoods() -> Response:
    try:
        is_fridge = request.args.get('is_fridge', type=lambda v: v.lower() == 'true')
        if is_fridge is None:
            foods = list(mongo_db.food.find())
        else:
            foods = list(mongo_db.food.find({"is_fridge": is_fridge}))
        # Convert ObjectId to string for JSON serialization
        for food in foods:
            food["_id"] = str(food["_id"])
        return jsonify({"foods": foods})   
    except Exception as e:
        return make_response({
            "message": "Server error",
            "error": str(e)
        }, 500)


@app.route("/api/foods/foodStatus", methods=["GET"])
def getFoodStatusList() -> Response:
    try:
    
        
        # Get current date for comparison
        current_date = datetime.now()
        # Get all matching foods
        foods = list(mongo_db.food.find())
        
        # Process each food item to add days until expiration
        for food in foods:
            # Convert expiration_date string to datetime
            exp_date = datetime.strptime(food["expiration_date"], "%Y-%m-%d")
            
            # Calculate days until expiration
            days_until_expiration = (exp_date - current_date).days
            
            # Add this information to the food item
            food["days_until_expiration"] = days_until_expiration
            
            # Convert ObjectId to string for JSON serialization
            food["_id"] = str(food["_id"])
        
        # Sort foods by days until expiration (ascending)
        sorted_foods = sorted(foods, key=lambda x: x["days_until_expiration"])
        sorted_soon_expire_soon_foods = []
        sorted_good_foods = []
        sorted_expired_foods = []
        # Add expiration status for easier frontend handling
        for food in sorted_foods:
            if food["days_until_expiration"] < 0:
                food["status"] = "expired"
                sorted_expired_foods.append(food)
            elif food["days_until_expiration"] <= 2:
                food["status"] = "expiring_soon"
                sorted_soon_expire_soon_foods.append(food)
            else:
                food["status"] = "good"
                sorted_good_foods.append(food)
        
        return jsonify({
            "foods": sorted_foods,
            "sorted_soon_expired_foods": sorted_soon_expire_soon_foods,
            "sorted_good_foods": sorted_good_foods,
            "sorted_expired_foods": sorted_expired_foods,
            "total_count": len(sorted_foods),
            "expired_count": sum(1 for food in sorted_foods if food["status"] == "expired"),
            "expiring_soon_count": sum(1 for food in sorted_foods if food["status"] == "expiring_soon"),
            "good_count": len(sorted_good_foods)
        })
        
    except Exception as e:
        return make_response({
            "message": "Server error",
            "error": str(e)
        }, 500)
if __name__ == "__main__":
    app.run(port=5000)
