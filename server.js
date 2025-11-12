const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
let books = require('./data');

const app = express();
const PORT = 3500;

app.use(cors());
app.use(bodyParser.json());

// Get all books
app.get('/api/books', (req, res) => {
  res.json(books);
});

// Get book by ID
app.get('/api/books/:id', (req, res) => {
  const book = books.find(b => b.id == Number(req.params.id));
  if (!book) return res.status(404).json({ message: 'Book not found' });
  res.json(book);
});

// Add book
app.post('/api/books', (req, res) => {
  const { title, author, price } = req.body;
  const newBook = { id: Date.now(), title, author, price };
  books.push(newBook);
  res.status(201).json(newBook);
});

// Edit book
app.put('/api/books/:id', (req, res) => {
  const book = books.find(b => b.id == Number(req.params.id));
  if (!book) return res.status(404).json({ message: 'Book not found' });
  Object.assign(book, req.body);
  res.json(book);
});

// Delete book
app.delete('/api/books/:id', (req, res) => {
  console.log(req.params.id);
  console.log(Number(req.params.id));
  const index = books.findIndex(b => b.id == Number(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Book not found' });
  books.splice(index, 1);
  console.log(books);
  res.json({ message: 'Book deleted' });
});

// Purchase book
app.post('/api/books/:id/purchase', (req, res) => {
  const book = books.find(b => b.id == Number(req.params.id));
  if (!book) return res.status(404).json({ message: 'Book not found' });
  res.json({ message: `Book "${book.title}" purchased successfully!` });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));