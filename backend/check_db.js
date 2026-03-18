const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const CandidateSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    patterns: {
        notes: [String]
    }
});

const Candidate = mongoose.models.Candidate || mongoose.model('Candidate', CandidateSchema);

async function checkCandidates() {
    try {
        console.log('Connecting to', process.env.MONGO_URI || 'mongodb://localhost:27017/recruit');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/recruit');
        console.log('Connected to DB');

        const candidates = await Candidate.find({}).sort({ updatedAt: -1 }).limit(5);

        candidates.forEach(c => {
            console.log(`Candidate: ${c.firstName} ${c.lastName}`);
            console.log(`Notes: ${JSON.stringify(c.patterns?.notes)}`);
            console.log('---');
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkCandidates();
