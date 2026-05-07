require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const dataFile = path.join(__dirname, 'data.json');
const sessionSecret = process.env.SESSION_SECRET || 'innovation-republic-secret';

const validCredentials = {
  username: process.env.PORTAL_USERNAME || 'guest@innovationrepublic.lr',
  password: process.env.PORTAL_PASSWORD || 'welcome2026'
};

const initialData = {
  visitorLogins: [],
  contacts: [],
  subscriptions: []
};
let storage = initialData;

function loadData() {
  try {
    if (fs.existsSync(dataFile)) {
      const raw = fs.readFileSync(dataFile, 'utf8');
      storage = JSON.parse(raw);
    }
  } catch (error) {
    console.error('Could not read data file:', error);
    storage = initialData;
  }
}

function saveData() {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(storage, null, 2), 'utf8');
  } catch (error) {
    console.error('Could not save data file:', error);
  }
}

loadData();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 2 }
  })
);

const requireLogin = (req, res, next) => {
  if (req.session && req.session.loggedIn) {
    return next();
  }
  res.redirect('/login.html');
};

app.post('/api/login', (req, res) => {
  const { username, password, name, organization, interest, goals, phone, country } = req.body;
  if (!username || !password || !name || !organization || !interest || !goals || !country) {
    return res.status(400).json({ success: false, message: 'Please complete all required fields.' });
  }

  if (username !== validCredentials.username || password !== validCredentials.password) {
    return res.status(401).json({ success: false, message: 'Invalid login credentials.' });
  }

  req.session.loggedIn = true;
  req.session.username = username;

  storage.visitorLogins.push({
    id: Date.now(),
    username,
    name,
    organization,
    interest,
    goals,
    phone: phone || 'Not provided',
    country,
    createdAt: new Date().toISOString()
  });
  saveData();

  res.json({ success: true, message: 'Visitor details received.' });
});

app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Please fill in your name, email, and message.' });
  }

  storage.contacts.push({
    id: Date.now(),
    name,
    email,
    message,
    createdAt: new Date().toISOString()
  });
  saveData();

  res.json({ success: true, message: 'Thank you! Your message has been received.' });
});

app.post('/api/newsletter', (req, res) => {
  const { email, interest } = req.body;
  if (!email || !interest) {
    return res.status(400).json({ success: false, message: 'Please provide your email and interest area.' });
  }

  storage.subscriptions.push({
    id: Date.now(),
    email,
    interest,
    createdAt: new Date().toISOString()
  });
  saveData();

  res.json({ success: true, message: 'You have been signed up for updates.' });
});

app.get('/api/status', (req, res) => {
  res.json({ success: true, status: 'OK' });
});

app.get('/portal', requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'portal.html'));
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login.html');
  });
});

app.use(express.static(path.join(__dirname)));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
