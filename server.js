const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
let books = require('./data');
let users = require('./users');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3500;

app.use(cors());
app.use(bodyParser.json());
app.use('/public/images/book-covers', express.static('/public/images/book-covers'));

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const user = users.find(u => u.email === email.toLowerCase());
    if (!user) return res.status(404).json({ message: 'User not registered' });

    //const match = await bcrypt.compare(password, user.password);
    const match = password === user.password; // remove this line when using bcrypt
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    // create a simple token or session in production use JWT
    // const token = createToken(user);
    res.json({ message: 'Login successful', user: { id: user.id, name: user.name, email: user.email } /*, token */ });
  } catch (err) {
    console.error('Login error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, phone, userType } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });

    const exists = users.find(u => u.email === email.toLowerCase());
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = { id: Date.now(), name, email: email.toLowerCase(), password: hashed, confirmPassword: hashed, phone: phone, userType: userType || 'CUSTOMER' };
    users.push(newUser);
    // do not return password
    const { password: _p, ...safe } = newUser;
    res.status(201).json({ message: 'User created', user: safe });
    console.log('Registered users:', users);
  } catch (err) {
    console.error('Signup error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

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
  const { title, author, category, price, oldPrice, image } = req.body;
  const newBook = { id: Date.now(), title, author, category, price, oldPrice, image  };
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
  res.json({ message: 'Book deleted' });
});

// Purchase book
app.post('/api/books/:id/purchase', (req, res) => {
  const book = books.find(b => b.id == Number(req.params.id));
  if (!book) return res.status(404).json({ message: 'Book not found' });
  res.json({ message: `Book "${book.title}" purchased successfully!` });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));