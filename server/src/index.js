require('dotenv').config();  // This must be the first line
const app = require('./server');
const connectDB = require('./config/database');

const PORT = process.env.PORT || 3000;

// Connect to MongoDB and start server
const start = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();