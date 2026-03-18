import mongoose from 'mongoose';
import "dotenv/config";

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/recruit-ai';

async function main() {
    try {
        await mongoose.connect(MONGO_URI);
        const db = mongoose.connection.db;
        if (!db) throw new Error('DB not found');

        const orgs = await db.collection('organizations').find({}).toArray();
        console.log('Organizations:', orgs.length);

        const users = await db.collection('users').find({}).toArray();
        console.log('Users:', users.length);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main();
