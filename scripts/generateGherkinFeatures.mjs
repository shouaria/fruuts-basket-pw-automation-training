/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable quotes */
/* eslint-disable no-console */
/* eslint-disable no-cond-assign */
import fs from "fs";
import path from "path";
import { sync as glob } from "glob";
import { execSync } from "child_process";

// This script checks for two things:
// 1. It checks for multiple step types in scenarios and throws an error if found
//
// Ex:
// await steps.GIVEN["I am on the Fruuts Basket home page"]();
// await steps.WHEN["I proceed to the product page for the fruit <fruitName>"]("Exotic Pineapple");
// await steps.WHEN["I choose to add a <fruitName> to my cart"]("Exotic Pineapple"); <--- This should be AND and the script will throw an error

// 2. It creates feature files in the root directory folder 'features' based upon our custom Gherkin Framework
//
// Ex:
// It will translate a '.spec.ts' file with the following structure:

// Scenario.describe(
//     "Fruuts Basket Home Page",
//     {
//         annotation: {
//             type: "Feature",
//             description: "As a user, I want to be able to do things on the home page",
//         },
//     },
//     () => {
//         Scenario("User is able to see details for the fruit 'Exotic Pineapple'", async ({ steps }) => {
//             await steps.GIVEN["I am on the Fruuts Basket home page"]();
//             await steps.WHEN["I proceed to the product page for the fruit <fruitName>"]("Exotic Pineapple");
//             await steps.THEN["I can see the fruit's name and details"]("Exotic Pineapple");
//         });
//     }
// );

// into a feature file with the following structure:

// Feature: Fruuts Basket Home Page

//   As a user, I want to be able to do things on the home page

//   Scenario: User is able to see details for the fruit 'Exotic Pineapple'
//     Given I am on the Fruuts Basket home page
//     When I proceed to the product page for the fruit 'Exotic Pineapple'
//     Then I can see the fruit's name and details

// We can use these feature files to easily view how our Gherkin looks in reports as
// well as read our Scenarios in a much clearer way. These files can also be embedded
// as documentation of what's currently in the automation suite.

/**
 * Splits a string of arguments while preserving quoted values with commas inside.
 * Handles double (") quotes.
 *
 * @param {string} argString - The string containing arguments separated by commas.
 * @returns {string[]} - An array of cleaned arguments with quotes removed.
 */
const splitArgs = (argString) => {
    const result = []; // Stores the extracted arguments
    let current = ""; // Holds the current argument being built
    let inQuotes = false; // Tracks if we are inside a quoted section

    for (let i = 0; i < argString.length; i += 1) {
        const char = argString[i];

        if (inQuotes) {
            // If inside quotes, check if we are closing the quote
            if (char === '"') {
                inQuotes = false; // Exit quoted mode
            } else {
                current += char; // Keep adding characters inside the quotes
            }
        }
        // If we encounter a quote, start a quoted section
        else if (char === '"') {
            inQuotes = true;
        } else if (char === ",") {
            // If we hit a comma **outside** of quotes, finalize the current argument
            result.push(current.trim());
            current = ""; // Reset for the next argument
        } else {
            // Otherwise, keep building the argument
            current += char;
        }
    }

    // Push the last argument (since there’s no trailing comma)
    result.push(current.trim());

    // Remove surrounding quotes from each argument (e.g., "'text'" → "text")
    return result
        .filter(Boolean)
        .map((arg) => arg.replace(/^['"`]|['"`]$/g, ""));
};

// Array to hold errors for multiple step types in scenarios
const multipleStepErrors = [];

// Function to extract scenario data from a single file
const extractScenarioData = (filePath) => {
    const fileContent = fs.readFileSync(filePath, "utf-8");

    // Extract feature and description
    const featureMatch = fileContent.match(
        /Scenario\.describe\(\s*["`](.*?)["`]/
    );
    const descriptionMatch = fileContent.match(/description:\s*["`](.*?)["`]/);

    const feature = featureMatch ? featureMatch[1] : "";
    const description = descriptionMatch ? descriptionMatch[1] : "";

    // Regex to match scenarios and their steps
    const scenarioRegex =
        /Scenario\(\s*["`](.*?)["`],\s*(?:\{\s*tag:\s*\[.*?\]\s*\},\s*)?async\s*\(\{[\s\S]*?\}\)\s*=>\s*\{([\s\S]*?)\}\);/g;

    const stepRegex = /await steps\.(\w+)\["(.*?)"\]\(([\s\S]*?)\);/g;

    const scenarios = [];
    let scenarioMatch;

    while ((scenarioMatch = scenarioRegex.exec(fileContent)) !== null) {
        const title = scenarioMatch[1]; // Extract scenario title
        const body = scenarioMatch[2]; // Extract scenario body
        const scenarioStartIndex = fileContent.indexOf(scenarioMatch[0]);
        const scenarioLineNumber = fileContent
            .substring(0, scenarioStartIndex)
            .split("\n").length;

        // Extract steps from the scenario body
        const seenStepTypes = new Set();
        const steps = [];
        let stepMatch;

        while ((stepMatch = stepRegex.exec(body)) !== null) {
            const type = stepMatch[1];
            if (type !== "AND" && seenStepTypes.has(type)) {
                const stepLineNumber =
                    scenarioLineNumber +
                    body.substring(0, stepMatch.index).split("\n").length -
                    1;
                multipleStepErrors.push({
                    type,
                    scenario: title,
                    file: filePath,
                    line: stepLineNumber,
                });
            }

            if (type !== "AND") {
                seenStepTypes.add(type);
            }

            const step = stepMatch[2];
            const args = splitArgs(stepMatch[3]); // Clean up arguments

            steps.push({ type, step, args });
        }

        // Map the scenario title and steps
        scenarios.push({
            title,
            steps,
        });
    }

    if (feature && description && scenarios.length > 0) {
        return {
            file: filePath,
            feature,
            annotation: {
                description,
            },
            scenarios,
        };
    }

    return null; // Return null if no valid data found
};

// Process all `.spec` files and collect scenario data
const processSpecFiles = (pattern, ignorePatterns) => {
    const specFiles = glob(pattern);
    const results = [];

    specFiles.forEach((filePath) => {
        // Skip files from ignored directories
        if (
            ignorePatterns.some((ignoredPattern) =>
                filePath.includes(ignoredPattern)
            )
        ) {
            return;
        }
        const data = extractScenarioData(filePath);
        if (data) {
            results.push(data);
        }
    });

    return results;
};

// Glob pattern to match all `.spec.ts` files, excluding unit tests
const pattern = "e2e/**/*.spec.ts";
const ignorePatterns = ["unit", "data-seeding"];

// Process the files and log the results
const scenarioData = processSpecFiles(pattern, ignorePatterns);

// Function to generate Gherkin content for a single feature
function generateFeatureFileContent(data) {
    const { feature, annotation, scenarios } = data;

    // Start with the Feature section
    let featureFileContent = `Feature: ${feature}\n\n`;
    featureFileContent += `  ${annotation.description}\n\n`;

    // Add each scenario
    scenarios.forEach((scenario) => {
        featureFileContent += `  Scenario: ${scenario.title}\n`;

        // Add steps for the scenario
        scenario.steps.forEach((step) => {
            // Transform step type to Capitalized (e.g., GIVEN -> Given)
            const formattedType =
                step.type.charAt(0).toUpperCase() +
                step.type.slice(1).toLowerCase();

            let gherkinStep = `${formattedType} ${step.step}`;

            // Replace placeholders (e.g., <accountType>, <pageName>) with actual arguments
            step.args.forEach((arg) => {
                gherkinStep = gherkinStep.replace(/<.*?>/, arg);
            });

            // Remove any leftover placeholders (e.g., <accountType>) if no argument is provided
            gherkinStep = gherkinStep.replace(/<.*?>/g, "").trim();

            featureFileContent += `    ${gherkinStep}\n`;
        });

        featureFileContent += "\n"; // Add a blank line between scenarios
    });

    return featureFileContent;
}

// Function to generate feature files for all features
function generateFeatureFiles(dataArray, outputDir) {
    // Ensure the output directory exists
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Iterate through all feature data and generate files
    dataArray.forEach((data) => {
        const featureFileContent = generateFeatureFileContent(data);
        const sanitizedFeatureName = data.feature
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "_"); // Sanitize filename
        const outputFilePath = path.join(
            outputDir,
            `${sanitizedFeatureName}.feature`
        );

        fs.writeFileSync(outputFilePath, featureFileContent);
        console.log(`Feature file generated: ${outputFilePath}`);
    });
}

// Generate gherkin files usage
const outputDir = "features"; // Output directory for feature files
generateFeatureFiles(scenarioData, outputDir);

// Check for multiple step types in scenarios
if (multipleStepErrors.length > 0) {
    console.log(""); // Empty space
    multipleStepErrors.forEach((error) => {
        console.error(
            `❌ Multiple ${error.type} step prefixes found in Scenario: "${error.scenario}"`
        );
        console.error(`   ${error.file}:${error.line}`);
        console.log(""); // Empty space
    });

    console.log(`\n🔎 Total multiples found: ${multipleStepErrors.length}`);
    console.log(
        "\nPlease replace prefix with AND before comitting (await steps.AND)"
    );
    process.exit(1);
}

// Check that new feature files are committed before allowing other commits
try {
    // Check for modified but unstaged .feature files
    const modifiedUnstaged = execSync("git diff --name-only -- '*.feature'", {
        encoding: "utf8",
    }).trim();
    // Check for untracked .feature files
    const untracked = execSync(
        "git ls-files --others --exclude-standard -- '*.feature'",
        { encoding: "utf8" }
    ).trim();

    if (modifiedUnstaged || untracked) {
        console.log("Error: Found '.feature' files in Git changes:");
        if (modifiedUnstaged)
            console.log("Modified but unstaged:\n", modifiedUnstaged);
        if (untracked) console.log("Untracked:\n", untracked);
        console.log(""); // Blank line
        console.log(
            "Please commit the newly changed '.feature' files before pushing"
        );
        process.exit(1); // Exit with error
    } else {
        console.log(
            "No .feature files found in Git changes. You can now push to remote!"
        );
    }
} catch (error) {
    console.error("An error occurred:", error.message);
    process.exit(1);
}
