# Library API - Complete cURL Documentation

This file contains cURL commands for all available routes in the Library API.
Base URL: https://primedev-library-app.vercel.app/

---

## 1. Authentication
Public endpoints for managing access.

### Login
curl -X POST https://primedev-library-app.vercel.app/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "shava@test.com", "password": "12345678"}'

### Register
curl -X POST https://primedev-library-app.vercel.app/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name": "John Doe", "email": "john@example.com", "password": "yourpassword"}'

---

## 2. Books
Endpoints for browsing and managing the book collection.

### List all books
curl -X GET https://primedev-library-app.vercel.app/books \
     -H "Authorization: Bearer YOUR_TOKEN"

### Search books (Query-based)
curl -X GET "https://primedev-library-app.vercel.app/books/search?query=Harry" \
     -H "Authorization: Bearer YOUR_TOKEN"

### Advanced Filtering (Category, Rating, Year, Popularity)
curl -X GET "https://primedev-library-app.vercel.app/books/filter?category=Fiction&minRating=4&sortBy=popularity" \
     -H "Authorization: Bearer YOUR_TOKEN"

### Get book by ID
curl -X GET https://primedev-library-app.vercel.app/books/:id \
     -H "Authorization: Bearer YOUR_TOKEN"

### Get book availability status
curl -X GET https://primedev-library-app.vercel.app/books/:id/status \
     -H "Authorization: Bearer YOUR_TOKEN"

### Create book (Admin only, handles cover upload)
curl -X POST https://primedev-library-app.vercel.app/books \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "title=New Book" -F "author=Author" -F "year=2024" -F "categoryId=1" -F "cover=@/path/to/cover.jpg"

### Update book (Admin only)
curl -X PUT https://primedev-library-app.vercel.app/books/:id \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{"title": "Updated Title"}'

### Delete book (Admin only)
curl -X DELETE https://primedev-library-app.vercel.app/books/:id \
     -H "Authorization: Bearer YOUR_TOKEN"

---

## 3. Users & Dashboard
Endpoints for user profiles and activity insights.

### List all users
curl -X GET https://primedev-library-app.vercel.app/users \
     -H "Authorization: Bearer YOUR_TOKEN"

### Get user by ID
curl -X GET https://primedev-library-app.vercel.app/users/:id \
     -H "Authorization: Bearer YOUR_TOKEN"

### Borrowing History
curl -X GET https://primedev-library-app.vercel.app/users/:id/borrowing-history \
     -H "Authorization: Bearer YOUR_TOKEN"

### Borrowing Stats (Counts & Fines)
curl -X GET https://primedev-library-app.vercel.app/users/:id/borrowing-stats \
     -H "Authorization: Bearer YOUR_TOKEN"

### User Activity Dashboard
curl -X GET https://primedev-library-app.vercel.app/users/:id/activity-dashboard \
     -H "Authorization: Bearer YOUR_TOKEN"

### Create User (Admin only)
curl -X POST https://primedev-library-app.vercel.app/users \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{"name": "User Name", "email": "user@test.com", "password": "password", "role": "USER"}'

---

## 4. Borrowings
Managing loans and returns.

### List all active borrowings
curl -X GET https://primedev-library-app.vercel.app/borrowings \
     -H "Authorization: Bearer YOUR_TOKEN"

### Upcoming due dates (Admin only)
curl -X GET https://primedev-library-app.vercel.app/borrowings/upcoming-due \
     -H "Authorization: Bearer YOUR_TOKEN"

### Create new borrowing (Admin only)
curl -X POST https://primedev-library-app.vercel.app/borrowings \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{"userId": 1, "bookId": 1}'

### Return a book (Admin only)
curl -X PUT https://primedev-library-app.vercel.app/borrowings/return/:id \
     -H "Authorization: Bearer YOUR_TOKEN"

---

## 5. Categories
Hierarchical category management.

### List all categories (flat)
curl -X GET https://primedev-library-app.vercel.app/categories \
     -H "Authorization: Bearer YOUR_TOKEN"

### Get Full Category Tree (Hierarchical)
curl -X GET https://primedev-library-app.vercel.app/categories/tree \
     -H "Authorization: Bearer YOUR_TOKEN"

### Get subcategories of a parent
curl -X GET https://primedev-library-app.vercel.app/categories/:id/subcategories \
     -H "Authorization: Bearer YOUR_TOKEN"

### Create Category (Admin only)
curl -X POST https://primedev-library-app.vercel.app/categories \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{"name": "History", "parentCategoryId": 1}'

---

## 6. Profiles & Reviews
Personalization and user feedback.

### Upload Profile Avatar
curl -X POST https://primedev-library-app.vercel.app/profiles/avatar \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "avatar=@/path/to/avatar.png"

### Create Book Review
curl -X POST https://primedev-library-app.vercel.app/reviews \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{"bookId": 1, "rating": 5, "comment": "Great book!"}'

### Get all reviews for a book
curl -X GET https://primedev-library-app.vercel.app/books/:id/reviews
