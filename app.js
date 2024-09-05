const express = require("express");
const app = express();
const port = process.env.PORT || 3001;
const path = require('path');
const cron = require('node-cron');

// cron.schedule('* * * * *', () => {
//   console.log('Running a task every minute');
// });

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.use(express.json())

const routes = require('./routes/web');
const apiRoutes = require('./routes/api');

// Home Page
app.use('/rate-tool', routes);

// API
app.use('/api', apiRoutes);

// 404 Page
app.get('*', (req, res) => {
  res.status(404).send('Page Not Found!');
})

const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`));

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
