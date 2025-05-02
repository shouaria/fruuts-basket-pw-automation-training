/* eslint-disable no-console */
import { sync as glob } from "glob";
import fs from "fs";

// This script updates the feature selection options in the GitHub Actions workflow
// 'Automation Tests' -- It checks for the current '.spec.ts' files
// and updates the workflow file accordingly

const workflowPath = ".github/workflows/automation-tests.yml";
const ignorePatterns = ["unit", "data-seeding"];

const generateOptions = () => {
    const testDirs = new Set();
    const specFiles = new Set();

    glob("e2e/**/*.spec.ts").forEach((file) => {
        // Skip files from ignored directories
        if (ignorePatterns.some((pattern) => file.includes(pattern))) {
            return;
        }

        // Remove "e2e/" prefix and ".spec.ts" extension
        const cleanFile = file.replace(/^e2e\//, "").replace(/\.spec\.ts$/, "");

        // Add directory
        const dir = cleanFile.substring(0, cleanFile.lastIndexOf("/"));
        testDirs.add(dir);

        // Add individual spec file
        specFiles.add(cleanFile);
    });

    // Generate the new options section
    return [
        "features/", // Add all tests option first
        ...Array.from(testDirs).sort(), // Add directories
        "--grep @SMOKE", // Add smoke tests option
        ...Array.from(specFiles).sort(), // Add specific features
    ]
        // The indent spacing of below option string
        // needs to match the workflow file indent spacing of options 
        // or it will falsely say options are up to date 
        // and not change anything
        .map((option) => `          - "${option}"`) // The - lines are 10 spaces indented (each indentation level is 2 spaces, and this is 5 levels deep).
        .join("\n");
};

try {
    // Read file content
    const workflowContent = fs.readFileSync(workflowPath, "utf8");

    // Generate new options
    const newOptions = generateOptions();

    // Create updated content
    const updatedContent = workflowContent.replace(
        /options:\n([\s\S]*?)(\n\s{8}required:)/m,
        `options:\n${newOptions}$2`
    );

    // Write updated content back to file if changes were made
    if (workflowContent !== updatedContent) {
        fs.writeFileSync(workflowPath, updatedContent, "utf8");
        console.log(
            `Updated workflow options in ${workflowPath}\nplease commit the changes`
        );
        process.exit(1);
    } else {
        console.log(`Workflow options are up to date in ${workflowPath}`);
    }
} catch (error) {
    console.error(`Error processing workflow file ${workflowPath}:`, error);
    process.exit(1);
}
