from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, PUT, DELETE)
    allow_headers=["*"],  # Allows all headers
)

# In-memory data store
books = [
    {
        "id": 1,
        "title": "To Kill a Mockingbird",
        "author": "Harper Lee",
        "description": "A novel about the serious issues of rape and racial inequality told through the eyes of a child."
    },
    {
        "id": 2,
        "title": "1984",
        "author": "George Orwell",
        "description": "A dystopian social science fiction novel and cautionary tale about the dangers of totalitarianism."
    },
    {
        "id": 3,
        "title": "Pride and Prejudice",
        "author": "Jane Austen",
        "description": "A romantic novel that critiques the British landed gentry at the end of the 18th century."
    },
    {
        "id": 4,
        "title": "The Great Gatsby",
        "author": "F. Scott Fitzgerald",
        "description": "A novel that explores themes of wealth, love, and the American Dream in 1920s America."
    },
    {
        "id": 5,
        "title": "Moby Dick",
        "author": "Herman Melville",
        "description": "A story of obsession and revenge as Captain Ahab hunts the white whale, Moby Dick."
    }
]


# Pydantic model for a Book
class Book(BaseModel):
    id: int
    title: str
    author: str
    description: Optional[str] = None

# Helper function to find a book by ID
def find_book(book_id: int):
    for book in books:
        if book['id'] == book_id:
            return book
    return None

# CRUD Operations

# 1. Create a new book
@app.post("/books/", response_model=Book)
def create_book(book: Book):
    if find_book(book.id) is not None:
        raise HTTPException(status_code=400, detail="Book with this ID already exists.")
    books.append(book.dict())
    return book

# 2. Read all books
@app.get("/books/", response_model=List[Book])
def get_books():
    return books

# 3. Read a book by ID
@app.get("/books/{book_id}", response_model=Book)
def get_book(book_id: int):
    book = find_book(book_id)
    if book is None:
        raise HTTPException(status_code=404, detail="Book not found.")
    return book

# 4. Update a book by ID
@app.put("/books/{book_id}", response_model=Book)
def update_book(book_id: int, updated_book: Book):
    book = find_book(book_id)
    if book is None:
        raise HTTPException(status_code=404, detail="Book not found.")
    book.update(updated_book.dict())
    return book

# 5. Delete a book by ID
@app.delete("/books/{book_id}", response_model=Book)
def delete_book(book_id: int):
    book = find_book(book_id)
    if book is None:
        raise HTTPException(status_code=404, detail="Book not found.")
    books.remove(book)
    return book