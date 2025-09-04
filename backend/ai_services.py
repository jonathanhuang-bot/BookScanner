import base64
from openai import OpenAI
from pydantic import BaseModel
import pandas as pd
import json

class Book(BaseModel):
    title: str
    author: str

class BookList(BaseModel):
    books: list[Book]

class Recommendation(BaseModel):
    title: str
    author: str
    matchScore: int
    matchReason: str

class RecommendationList(BaseModel):
    recommendations: list[Recommendation]

#look at bookshelf image and extract all titles from the spines of books
def analyze_bookshelf(image_path):
    client = OpenAI()
    def encode_image(image_path):
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode("utf-8")
        
        
    base64_image = encode_image(image_path)
    # response = client.responses.create(
    #     model = "gpt-4o-mini",
    #     response_format={"type": "json_object"},
    #     input = [
    #         {
    #             "role": "user",
    #             "content": [
    #                 {"type": "input_text", "text": "Please list all the titles and authors of the books you see on this bookshelf. Return as JSON with format: {\"books\": [{\"title\": \"book title\", \"author\": \"author name\"}]}"},
    #                 {"type": "input_image", "image_url": f"data:image/jpeg;base64,{base64_image}",},
    #             ],
    #         }
    #     ],
    # )   
    response = client.chat.completions.create(
        model="gpt-4.1",
        response_format={"type": "json_schema", "json_schema": {"name": "BookList", "schema": BookList.model_json_schema()}},
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "Please list all the titles and authors of the books you see on this bookshelf."},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}},
                ],
            }
        ],
    )
    #print(response)
    books_data = json.loads(response.choices[0].message.content)
    books = books_data["books"]
    return books



#generate recommendations using personal preferences/goodreads data from the list of books extracted
def generate_recommendations(personal_preferences, list_of_books):
    '''personal_preferences: json?'''
    client = OpenAI()

    response = client.chat.completions.create(
        model="gpt-4.1",
        response_format={"type": "json_schema", "json_schema": {"name": "RecommendationList", "schema": RecommendationList.model_json_schema()}},
        messages=[
            {
                "role": "system",
                "content": """You are a literary recommendation expert. Your task is to select books from a provided list that best match the user's specific reading preferences, and provide a brief explanation for each match.

CRITICAL INSTRUCTIONS:
1. You MUST ONLY select books from the exact list provided to you
2. Do NOT invent or suggest books that are not in the provided list
3. Do NOT recommend books that are similar but not on the list
4. The ONLY valid recommendations are books EXPLICITLY listed in the JSON array I will provide
5. If you can't find 5 good recommendations from the list, return fewer recommendations
6. Base your selections on how well each book aligns with the user's stated genre preferences, favorite authors, and reading history
7. If the user has a "Want to Read" list from Goodreads, PRIORITIZE books that are similar to those on their list
8. For each book, provide a SPECIFIC, CONCISE reason (1-2 sentences) explaining the match
9. When a book is similar to something on their "Want to Read" list, mention this specific connection in the match reason
10. Match reasons should ONLY reference preferences the user explicitly mentioned - no assumptions
11. Higher scoring books should have more specific, compelling match reasons"""
            },
            {
                "role": "user",
                "content": f"""Here is my list of books: {list_of_books}

My reading preferences: {personal_preferences}

From ONLY this list above, recommend the 5 books that would best match my reading preferences.

Format your response as a JSON object with a "recommendations" array containing ONLY books from my list.
Each recommendation should include:
- title: The exact book title from my list
- author: The exact author name from my list
- matchScore: A number between 1-100 indicating how well this book matches my preferences
- matchReason: A SPECIFIC, CONCISE reason (1-2 sentences) why this book matches my preferences.

Only return the JSON object with no additional text."""
            }
        ],
    )
    recommendation_data = json.loads(response.choices[0].message.content)
    books = recommendation_data["recommendations"]
    return books
    
def load_goodreads_preferences(csv_path):
      df = pd.read_csv(csv_path)
      return df[['Title', 'Author', 'My Rating', 'Exclusive Shelf', 'Date Read']].to_dict('records')




list_of_books = analyze_bookshelf("C:\\Users\\jonat\\Desktop\\BookScanner\\test.JPG")
personal_preferences = load_goodreads_preferences("C:\\Users\\jonat\\Desktop\\BookScanner\\goodreads_library_export.csv")
recommendations = generate_recommendations(personal_preferences, list_of_books)
print(recommendations)
