const { talentDiscoveryService } = require('./src/services/talentDiscoveryService');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function debugDiscovery() {
    console.log('Debugging Talent Discovery...');
    try {
        const fakeJD = "We need a Senior React Developer with experience in Node.js and TypeScript.";
        const results = await talentDiscoveryService.discoverCandidates(fakeJD);
        console.log('SUCCESS: Found', results.length, 'candidates');
    } catch (e) {
        console.error('DISCOVERY FAILED:', e.message);
        if (e.stack) console.error(e.stack);
    }
}

// Since it's TS, running direct with node might fail if it needs imports.
// I'll use ts-node if available, or just look at the code.
debugDiscovery();
