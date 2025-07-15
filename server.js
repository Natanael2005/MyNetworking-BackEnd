import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import connectDB from './config/mongo.js';

const PORT = process.env.PORT || 4000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  });
});
