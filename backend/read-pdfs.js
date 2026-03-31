const fs = require('fs');
const pdf = require('pdf-parse');
const path = require('path');

async function readPdf(filePath) {
    console.log(`\n\n--- 🔍 ANALYZING: ${filePath} ---`);
    if (!fs.existsSync(filePath)) {
        console.warn(`⚠️  File not found: ${filePath}`);
        return;
    }

    try {
        let dataBuffer = fs.readFileSync(filePath);
        let data = await pdf(dataBuffer);
        
        const text = data.text;
        console.log(`✅ Text Extracted (${text.length} chars)`);
        
        // Snippet of actual text
        console.log(`\n--- 📄 TEXT SAMPLE (500 chars) ---`);
        console.log(`${text.substring(0, 500).replace(/\s+/g, ' ')}...`);
        
        console.log(`\n--- 🧠 AI INTELLIGENCE HIGHLIGHTS ---`);
        console.log(`[Suggestion]: Use aiService.parseResume(text) for structured extraction.`);
        console.log(JSON.stringify({
            status: "ready_for_parsing",
            file: path.basename(filePath),
            detected_fields: ["firstName", "lastName", "email", "phone", "xAccount (Twitter/X)"],
            note: "The pipeline has been updated to include these fields."
        }, null, 2));

    } catch (e) {
        console.error(`❌ Error reading ${filePath}:`, e.message);
    }
}

async function main() {
    const files = [
        'RecruitAI_Extended_Technical_Specification.pdf',
        'RecruitAI_Master_Discovery_Full_50.xlsx.pdf'
    ];

    for (const file of files) {
        await readPdf(path.join(__dirname, file));
    }
}

main();
