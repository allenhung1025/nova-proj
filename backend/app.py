from flask import Flask, request, jsonify
from flask_cors import CORS


from openai import OpenAI


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

if __name__ == "__main__":
    app.run(port=5000)
