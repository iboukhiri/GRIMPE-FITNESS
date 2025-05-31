import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/grimpe';

export const connectDB = async () => {
  try {
    // Configure mongoose options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 45000,  // 45 seconds
      serverSelectionTimeoutMS: 10000, // 10 seconds
      family: 4 // Use IPv4, skip trying IPv6
    };

    console.log('Tentative de connexion à MongoDB...');
    console.log('URI:', MONGODB_URI);
    
    const conn = await mongoose.connect(MONGODB_URI, options);
    console.log(`✅ MongoDB Connecté: ${conn.connection.host}`);
    console.log(`📊 Base de données: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ Erreur de connexion à MongoDB: ${error.message}`);
    console.error('💡 Solutions possibles:');
    console.error('   1. Vérifiez que MongoDB est installé et démarré');
    console.error('   2. Vérifiez l\'URI de connexion dans .env');
    console.error('   3. Installez MongoDB Community Edition depuis https://www.mongodb.com/try/download/community');
    
    // En développement, continuer sans MongoDB pour diagnostiquer
    if (process.env.NODE_ENV !== 'production') {
      console.log('⚠️  Mode développement: Serveur démarré sans base de données');
      console.log('   Certaines fonctionnalités seront limitées');
    } else {
      process.exit(1);
    }
  }
}; 