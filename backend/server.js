require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const app = require('./app');

const port = Number(process.env.PORT) || 5000;
app.listen(port, () => {
  console.log(`ShopEase running at http://localhost:${port}`);
});
