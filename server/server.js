// server.js

import express from 'express' ; 
import dotenv from 'dotenv';


// Load env variables
dotenv.config();



const app = express() ; 
const PORT = process.env.PORT || 3000 ; 




// Middleware to parse JSON
app.use(express.json());

//  route
app.get('/', (req, res) => {
  res.send('Hello from Node.js Server!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

