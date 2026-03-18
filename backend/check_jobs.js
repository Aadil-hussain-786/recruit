const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const JobSchema = new mongoose.Schema({
    title: String,
    description: String,
    organization: mongoose.Schema.Types.ObjectId
});

const Job = mongoose.models.Job || mongoose.model('Job', JobSchema);

async function checkJobs() {
    try {
        console.log('Connecting to', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const jobs = await Job.find({});
        console.log(`Found ${jobs.length} jobs`);

        jobs.forEach(j => {
            console.log(`Job ID: ${j._id}, Title: ${j.title}`);
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkJobs();
