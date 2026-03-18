import mongoose from 'mongoose';
import "dotenv/config";

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/recruit-ai';

async function main() {
    try {
        await mongoose.connect(MONGO_URI);
        const db = mongoose.connection.db;
        if (!db) {
            throw new Error('Database connection failed');
        }
        const collections = await db.listCollections().toArray();
        console.log('Collections in database:');
        collections.forEach(c => console.log(' - ' + c.name));
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main();
