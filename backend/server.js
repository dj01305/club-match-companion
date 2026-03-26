require('dotenv').config();
const { createApp } = require('./src/app');

const PORT = process.env.PORT || 3001;

createApp().then((app) => {
  app.listen(PORT, () => {
    console.log(`Club Match Companion API running on port ${PORT}`);
  });
});
