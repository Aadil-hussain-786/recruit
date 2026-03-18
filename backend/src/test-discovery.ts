import { talentDiscoveryService } from './services/talentDiscoveryService';
import { aiService } from './services/aiService';

async function testDiscovery() {
    console.log("Starting test discovery...");
    const jdText = "Service Robot System Engineer - Expertise in ROS 2, C++, and mobile robotics required.";
    try {
        const results = await talentDiscoveryService.discoverCandidates(jdText);
        console.log("Discovery successful. Results found:", results.length);
        console.log(JSON.stringify(results.slice(0, 2), null, 2));
    } catch (error) {
        console.error("Discovery failed:", error);
    }
}

testDiscovery();
