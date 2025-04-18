const fs = require('fs');

function getConfig() {
    try {
        const fileContent = fs.readFileSync("config.json", "utf8");
        return JSON.parse(fileContent);
    } catch (error) {
        console.error("Error reading or parsing file:", error);
    }
}
