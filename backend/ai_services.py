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

class GenreList(BaseModel):
      genres: list[str]

class AvoidElements(BaseModel):
    elements: str

#look at bookshelf image and extract all titles from the spines of books
def analyze_bookshelf(image_base64):
    client = OpenAI()
     
    response = client.chat.completions.create(
        model="gpt-4.1",
        response_format={"type": "json_schema", "json_schema": {"name": "BookList", "schema": BookList.model_json_schema()}},
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "Please list all the titles and authors of the books you see on this bookshelf."},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"}},
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
6. Base your selections on how well each book aligns with the user's stated genre preferences, favorite authors, and reading history. IMPORTANTLY: If the user has specified things to avoid, strongly avoid recommending books that contain those elements.
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

From ONLY this list above, recommend the 5 books that would best match my reading preferences while avoiding the elements I specified.

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

def extract_goodreads_preferences(csv_file):
    import io

    # Read CSV from uploaded file
    csv_content = csv_file.read().decode('utf-8')
    df = pd.read_csv(io.StringIO(csv_content))

    # Extract favorite authors (from 4-5 star books)
    high_rated = df[(df['My Rating'] >= 4) & (df['My Rating'] <= 5)]
    favorite_authors = high_rated['Author'].value_counts().head(10).index.tolist()

    # Extract books to avoid (from 1-2 star books)
    low_rated = df[(df['My Rating'] >= 1) & (df['My Rating'] <= 2)]
    avoid_titles = low_rated['Title'].tolist()[:5]  # Get a few examples

    # Use AI to infer genres from highly-rated books
    genres = infer_genres_from_books(high_rated['Title'].tolist()[:20])

    # Create avoid string from low-rated book analysis
    avoid_elements = infer_avoid_elements(avoid_titles) if avoid_titles else ""

    return {
        'authors': favorite_authors,
        'genres': genres,
        'avoid': avoid_elements
    }

def infer_genres_from_books(book_titles):
    if not book_titles:
        return []

    client = OpenAI()

    response = client.chat.completions.create(
        model="gpt-4.1",
        response_format={"type": "json_schema", "json_schema": {"name": "GenreList", "schema": GenreList.model_json_schema()}},
        messages=[
            {
                "role": "user",
                "content": f"""Based on these book titles that a user rated highly, what are the top 5 most likely genres they enjoy?

Books: {', '.join(book_titles[:15])}

Select only from this list: Fantasy, Sci-Fi, Mystery, Romance, Thriller, Historical, Biography, Self-Help, Horror, Literary Fiction,
Young Adult, Non-Fiction

Return the top 5 genres as a JSON object with a "genres" array."""
            }
        ],
    )

    genres_data = json.loads(response.choices[0].message.content)
    return genres_data["genres"][:5]  # Limit to 5 genres

def infer_avoid_elements(avoid_titles):
    if not avoid_titles:
        return ""

    client = OpenAI()

    response = client.chat.completions.create(
        model="gpt-4.1",
        response_format={"type": "json_schema", "json_schema": {"name": "AvoidElements", "schema":
    AvoidElements.model_json_schema()}},
        messages=[
            {
                "role": "user",
                "content": f"""Based on these book titles that a user rated poorly (1-2 stars), what elements should they probably
    avoid?

    Books: {', '.join(avoid_titles)}

    Return a short comma-separated string of elements to avoid (e.g., "Romance, Violence, Sad endings"). Keep it under 50 characters.

    Return as JSON with an "elements" field."""
            }
        ],
    )

    avoid_data = json.loads(response.choices[0].message.content)
    return avoid_data["elements"]

# list_of_books = analyze_bookshelf("C:\\Users\\jonat\\Desktop\\BookScanner\\test.JPG")
# personal_preferences = load_goodreads_preferences("C:\\Users\\jonat\\Desktop\\BookScanner\\goodreads_library_export.csv")
# recommendations = generate_recommendations(personal_preferences, list_of_books)
# print(recommendations)
