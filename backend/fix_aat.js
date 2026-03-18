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

async function fixCandidate() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/recruit-ai');
        console.log('Connected to DB');

        const candidate = await Candidate.findOne({ firstName: 'Aadil', lastName: 'Hussain' });
        if (candidate) {
            console.log('Found Aadil Hussain. Fixing patterns...');
            candidate.patterns = candidate.patterns || {};
            candidate.patterns.notes = [
                "Initial profile scan: Experienced in frontend but seeks backend exposure.",
                "Candidate exhibits the 'Unprepared Novice' archetype. The candidate demonstrated a significant DELTA between assumed readiness and actual technical knowledge. The candidate was unable to answer basic questions related to data pipelines and React's DOM manipulation, indicating a lack of practical experience or a misrepresentation of skills."
            ];
            await candidate.save();
            console.log('Data fixed.');
        } else {
            console.log('Candidate not found.');
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

fixCandidate();
