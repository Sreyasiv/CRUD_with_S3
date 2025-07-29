require('dotenv').config();
const express = require('express');

const uploadRoute = require('./CRUD/uploadRoute');
const getRoute = require('./CRUD/getRoute');
const deleteRoute = require('./CRUD/deleteRoute');
const updateRoute = require('./CRUD/updateRoute');

const app = express();

app.use(express.json());
app.use('/api', uploadRoute);
app.use('/api', getRoute);
app.use('/api', deleteRoute);
app.use('/api', updateRoute);

app.get('/', (req, res) => {
  res.send('🟢 Express server is running on port 7070.');
});

app.listen(7070, () => {
  console.log('🟢 Server running at http://localhost:7070');
});
