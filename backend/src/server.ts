import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from './app';

const PORT = process.env.PORT || 5000;
let mongoServer: MongoMemoryServer | null = null;

const startServer = async () => {
    try {
        let mongoUri: string;
        
        // Check if we have a valid remote MongoDB URI
        const mongoUri_env = process.env.MONGO_URI;
        const isLocalhost = !mongoUri_env || mongoUri_env.includes('localhost') || mongoUri_env.includes('127.0.0.1');
        
        if (!isLocalhost && mongoUri_env) {
            // Use provided remote MONGO_URI
            console.log('Using remote MONGO_URI from environment variables');
            mongoUri = mongoUri_env;
        } else {
            // Use in-memory MongoDB for development/testing
            console.log('Starting in-memory MongoDB server...');
            
            // Set higher timeout and memory limit
            process.env.MONGOMS_LAUNCH_TIMEOUT = '120000';
            process.env.MONGOMS_DOWNLOAD_DIR = './mongodb-download';
            
            try {
                mongoServer = await MongoMemoryServer.create({
                    instance: {
                        port: 27017,
                    }
                });
                mongoUri = mongoServer.getUri();
                console.log(`In-memory MongoDB started at: ${mongoUri}`);
            } catch (memoryError) {
                console.error('Failed to start in-memory MongoDB:', memoryError);
                console.log('Falling back to localhost connection...');
                mongoUri = 'mongodb://localhost:27017/recruit-ai';
            }
        }

        console.log('Connecting to MongoDB via Mongoose...');
        await mongoose.connect(mongoUri);
        console.log('MongoDB Connected');

        console.log('Starting Express server...');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Error starting server:', error);
        if (mongoServer) {
            await mongoServer.stop();
        }
        process.exit(1);
    }
};

console.log('Starting server process...');
startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    if (mongoServer) {
        await mongoServer.stop();
    }
    process.exit(0);
});

// files.watcherExclude: {
//   "**/node_modules/**": true,
//   "**/dist/**": true,
//   "**/.next/**": true
// }
