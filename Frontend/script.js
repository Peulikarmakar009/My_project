const apiUrl = "http://127.0.0.1:8000/books/";
let books = []; // Global variable to store books

// Fetch and display books
async function fetchBooks() {
    try {
        const response = await fetch(apiUrl);
        books = await response.json(); // Store fetched books
        renderBookList();
    } catch (error) {
        console.error("Error fetching books:", error);
        alert("Failed to fetch books. Please try again later.");
    }
}

// Render the book list as tiles
function renderBookList() {
    const bookList = document.getElementById('book-list');
    bookList.innerHTML = ''; // Clear existing list

    if (books.length === 0) {
        bookList.innerHTML = '<div class="col-12"><p class="text-center">No books available. Add a new book!</p></div>';
        return;
    }

    books.forEach(book => {
        const bookItem = document.createElement('div');
        bookItem.className = 'col-md-4 col-lg-3 mb-4';
        bookItem.dataset.id = book.id;  // Add a data attribute to store the book ID

        bookItem.innerHTML = `
            <div class="card h-100">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${book.title}</h5>
                    <h6 class="card-subtitle mb-2 text-muted">${book.author}</h6>
                    <p class="card-text">${book.description}</p>
                    <div class="mt-auto d-flex justify-content-between">
                        <button class="btn btn-sm btn-warning" onclick="toggleEditMode(${book.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteBook(${book.id})" title="Delete">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
                <div class="edit-fields p-3" style="display: none;">
                    <input type="text" id="edit-title-${book.id}" value="${book.title}" placeholder="Title" class="form-control mb-2">
                    <input type="text" id="edit-author-${book.id}" value="${book.author}" placeholder="Author" class="form-control mb-2">
                    <textarea id="edit-description-${book.id}" rows="3" placeholder="Description" class="form-control mb-2">${book.description}</textarea>
                    <div class="d-flex justify-content-between">
                        <button class="btn btn-success btn-sm" onclick="saveBook(${book.id})">Save</button>
                        <button class="btn btn-secondary btn-sm" onclick="cancelEdit(${book.id})">Cancel</button>
                    </div>
                </div>
            </div>
        `;

        bookList.appendChild(bookItem);
    });
}

// Toggle edit mode for a book
function toggleEditMode(bookId) {
    const bookItem = document.querySelector(`div[data-id="${bookId}"]`);  // Select the book item by the data-id attribute
    const editFields = bookItem.querySelector('.edit-fields');
    const bookDetails = bookItem.querySelector('.card-body');

    const isEditing = editFields.style.display === 'block';

    if (isEditing) {
        cancelEdit(bookId);
    } else {
        bookItem.classList.add('edit-mode');
        editFields.style.display = 'block';
        bookDetails.style.display = 'none';
    }
}

// Save updated book
async function saveBook(bookId) {
    const bookItem = document.querySelector(`div[data-id="${bookId}"]`);
    const title = bookItem.querySelector(`#edit-title-${bookId}`).value.trim();
    const author = bookItem.querySelector(`#edit-author-${bookId}`).value.trim();
    const description = bookItem.querySelector(`#edit-description-${bookId}`).value.trim();

    if (!title || !author) {
        alert("Please fill in the required fields: Title and Author.");
        return;
    }

    const updatedBook = { id: bookId, title, author, description };

    try {
        const response = await fetch(`${apiUrl}${bookId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedBook)
        });

        if (!response.ok) {
            throw new Error('Failed to update the book.');
        }

        // Refresh the book list
        fetchBooks();
    } catch (error) {
        console.error("Error updating book:", error);
        alert("Failed to update the book. Please try again later.");
    }
}

// Cancel edit mode
function cancelEdit(bookId) {
    const bookItem = document.querySelector(`div[data-id="${bookId}"]`);
    bookItem.classList.remove('edit-mode');
    bookItem.querySelector('.edit-fields').style.display = 'none';
    bookItem.querySelector('.card-body').style.display = 'block';
}

// Delete a book
async function deleteBook(bookId) {
    if (!confirm("Are you sure you want to delete this book?")) {
        return;
    }

    try {
        const response = await fetch(`${apiUrl}${bookId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete the book.');
        }

        // Refresh the book list
        fetchBooks();
    } catch (error) {
        console.error("Error deleting book:", error);
        alert("Failed to delete the book. Please try again later.");
    }
}

// Add Book Form Submission
document.getElementById('book-form').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent the form from submitting the traditional way

    const title = document.getElementById('title').value.trim();
    const author = document.getElementById('author').value.trim();
    const description = document.getElementById('description').value.trim();

    if (!title || !author) {
        alert("Please fill in the required fields: Title and Author.");
        return;
    }

    const newBook = {
        id: Date.now(),  // Generates a unique ID based on the current time
        title,
        author,
        description
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newBook)
        });

        if (!response.ok) {
            throw new Error('Failed to add the book.');
        }

        // Clear the form fields after successful submission
        document.getElementById('book-form').reset();

        // Refresh the book list
        fetchBooks();
    } catch (error) {
        console.error("Error adding book:", error);
        alert("Failed to add the book. Please try again later.");
    }
});

// Initialize the app by fetching books when the page loads
document.addEventListener('DOMContentLoaded', fetchBooks);
