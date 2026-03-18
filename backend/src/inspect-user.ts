import mongoose from 'mongoose';
import "dotenv/config";

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/recruit-ai';

async function main() {
    try {
        await mongoose.connect(MONGO_URI);
        const db = mongoose.connection.db;
        if (!db) throw new Error('DB not found');

        const user = await db.collection('users').findOne({});
        console.log('Sample User:', JSON.stringify(user, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main();
