const app = require('./src/app');
require('dotenv').config();


const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}\n http://0.0.0.0:${PORT}`);
});

