/* eslint-disable no-console */
import fs from "node:fs";
import path from "node:path";

const filePath = path.resolve("e2e/support/step-definitions/steps.ts");
const sections = ["GIVEN", "WHEN", "THEN", "AND"];

// Function to alphabetize the functions inside each section
const alphabetizeSections = (fileContent) => {
    sections.forEach((section) => {
        const regex = new RegExp(`(get ${section}\\(\\)\\s*{\\s*return \\{)([\\s\\S]*?)(\\};)`, "g");

        // eslint-disable-next-line no-param-reassign
        fileContent = fileContent.replace(regex, (match, start, functions, end) => {
            const sortedFunctions = functions
                .trim()
                .split("\n")
                .filter((line) => line.trim()) // Remove empty lines
                .sort((a, b) => a.trim().localeCompare(b.trim()))
                .map((line) => line.trim()) // Trim each line to align indentation
                .join("\n            "); // Uniform indentation for alignment

            return `${start}\n            ${sortedFunctions}\n        ${end}`;
        });
    });

    return fileContent;
};

try {
    // Read file content
    const fileContent = fs.readFileSync(filePath, "utf8");

    // Alphabetize the functions in each section
    const updatedContent = alphabetizeSections(fileContent);

    // Write updated content back to file if changes were made
    if (fileContent !== updatedContent) {
        fs.writeFileSync(filePath, updatedContent, "utf8");
        console.log(`Alphabetized step functions in ${filePath}
please commit the changes`);
        process.exit(1);
    } else {
        console.log(`Step functions are alphabetized in ${filePath}`);
    }
} catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
}
