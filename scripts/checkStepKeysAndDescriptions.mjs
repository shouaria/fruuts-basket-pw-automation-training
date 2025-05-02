/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable quotes */
import fs from "fs";
import { sync as glob } from "glob";

// This script checks that 'Step' keys and descriptions (what shows on test report) match
// Ex:
// THEN: (prefix: ThenPrefix = THEN_PREFIX) => ({
// KEY -->  "I am on the '<pageName>' page": async (pageName: keyof typeof pageClassMap) => {
// DESC -->    await Step(prefix, `I am on the '${pageName}' page`,

// Usage: You can match '<pageName>' in the key to the description '${pageName}'
// You can also match '<see|don't see>' in the key to the description '${seeOrDontSee}'

// Directory containing step definition files
const stepsDir = "e2e/**/*.steps.ts";

let totalMismatches = 0; // Counter for total mismatches

// Get all `.steps.ts` files in the directory
glob(stepsDir).forEach((file) => {
    if (file.length === 0) {
        console.error("No .steps.ts files found in", stepsDir);
        process.exit(1);
    }

    // Function to validate a file

    let fileContent;
    try {
        fileContent = fs.readFileSync(file, "utf8");
    } catch (error) {
        console.error("Error reading the file:", error);
        return;
    }

    // Regex to capture the original key positions before modifications
    const keyRegex = /["](.*?)["]:\s*async\s*\([^)]*\)\s*=>/g;

    const originalMatches = [...fileContent.matchAll(keyRegex)];

    // Store original line numbers for each key
    const originalLineNumbers = [];

    originalMatches.forEach((match) => {
        const lineNumber = fileContent
            .substring(0, match.index)
            .split("\n").length;
        originalLineNumbers.push(lineNumber);
    });

    // Replace all single quotes with double quotes and backticks with double quotes
    // Also removes parameters inside async functions for keys
    // This is needed to find regex
    const updatedContent = fileContent
        .replace(/`/g, '"')
        .replace(/"/g, "'")
        .replace(/'/g, " ' ") // this enforces space around quotes otherwise regex cannot differentiate between closing quotes and quotes right before closing quotes
        .replace(
            /(["'`][^"'`]+["'`])\s*:\s*async\s*\([^)]*\)\s*=>/g,
            "$1: async () =>"
        );

    // Regex to capture key and description in Step
    const keyAndStepDescriptionRegex =
        /['](.*?)[']:\s*async\s*\(\)\s*=>\s*(?:\{[\s\S]*?)?(?:await\s+)?Step\s*\(\s*prefix\s*,\s*['](.*?)[']\s*,/g;

    const updatedContentMatches = [
        ...updatedContent.matchAll(keyAndStepDescriptionRegex),
    ];

    // Compare the keys and descriptions
    updatedContentMatches.forEach((match, index) => {
        let key = match[1];
        let description = match[2];

        // Replace '|' with "Or", capitalize words after '|', and remove spaces & apostrophes
        // This allows for keys that have <see|don't see> to match <seeOrDontSee>
        key = key.replace(
            /<(.*?)>/g,
            (newMatch, content) =>
                `<${content
                    .replace(/'/g, "") // Remove apostrophes
                    .replace(/ {2}/g, "")
                    .split("|") // Split sections at '|'
                    .map(
                        (section, sectionIndex) =>
                            section
                                .trim() // Trim any extra spaces around each section
                                .split(/\s+/) // Split words inside each section
                                .map(
                                    (word, wordIndex) =>
                                        sectionIndex === 0 && wordIndex === 0
                                            ? word // Keep the first word lowercase
                                            : word.charAt(0).toUpperCase() +
                                              word.slice(1) // Capitalize other words
                                )
                                .join("") // Join the words back without spaces
                    )
                    .join("Or")}>` // Join sections with "Or"
        );

        // Replace placeholders with encased placeholder names i.e.: <placeholderName>
        description = description.replace(/\${([^}]+)}/g, "<$1>");

        if (key !== description) {
            totalMismatches += 1;

            // Reformats outputted step to look accurate without extra spacing
            key = key.replace(/ ' /g, "'").trim();

            description = description.replace(/ ' /g, "'").trim();

            // Use index to get the original line number
            const lineNumber = originalLineNumbers[index] || "Unknown";

            console.error(`❌ Mismatch in ${file}:${lineNumber}`);
            console.error(`   Key: "${key}"`);
            console.error(`   Description: "${description}"`);
            console.log(""); // Empty space
        }
    });
});

if (totalMismatches > 0) {
    console.log(`\n🔎 Total mismatches found: ${totalMismatches}`);
    console.log(
        "You must match the step keys and descriptions before committing"
    );
    process.exit(1);
} else {
    console.log("All step keys and descriptions match!");
}
