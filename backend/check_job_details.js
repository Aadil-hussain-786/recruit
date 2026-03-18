const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const JobSchema = new mongoose.Schema({
    title: String,
    description: String
});

const Job = mongoose.models.Job || mongoose.model('Job', JobSchema);

async function checkJobDetails() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const jobs = await Job.find({});
        jobs.forEach(j => {
            console.log(`Title: ${j.title}`);
            console.log(`Desc: ${j.description?.substring(0, 100)}...`);
            console.log('---');
        });
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkJobDetails();
