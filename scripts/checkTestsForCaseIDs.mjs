/* eslint-disable no-console */
import { sync as glob } from "glob";
import fs from "node:fs";

// This script checks all tests and scenarios for Test Case IDs prefixed as a
// test or scenario title and wrapped in brackets
// Ex: Scenario("[C2741242] - User is able to see a 'Blueberry Burst' on the first page"

const allTestCaseIDs = new Map();
const duplicateTestCaseIDs = new Map();
const missingTestCaseIDs = [];

glob("e2e/features/**/*.spec.ts", {
    ignore: "e2e/features/unit/**/*.spec.ts",
}).forEach((file) => {
    const testContentLines = fs.readFileSync(file).toString().split("\n");

    testContentLines.forEach((line, lineNumber) => {
        const testNameMatch = line.match(/(?:test|Scenario)\("([^"]+)"/);

        if (testNameMatch) {
            const testName = testNameMatch[1];
            const testCaseIDMatch = line.match(/\[C(\d+)\]/); // <-- The 'C' is standard for TestRail, replace this with any other tag for other TCMs if needed

            if (testCaseIDMatch) {
                const testCaseID = testCaseIDMatch[1];
                const testCase = { file, lineNumber, testName };

                if (!allTestCaseIDs.has(testCaseID)) {
                    allTestCaseIDs.set(testCaseID, [testCase]);
                } else {
                    allTestCaseIDs.get(testCaseID).push(testCase);
                }
            } else {
                missingTestCaseIDs.push({ file, lineNumber, testName });
            }
        }
    });
});

allTestCaseIDs.forEach((tests, testCaseID) => {
    if (tests.length > 1) {
        duplicateTestCaseIDs.set(testCaseID, tests);
    }
});

if (missingTestCaseIDs.length > 0) {
    console.log("Test Case IDs are missing for the following tests:");
    missingTestCaseIDs.forEach(({ file, lineNumber, testName }) => {
        console.log(`  ${file}:${lineNumber + 1} - ${testName}`);
    });
    console.log(); // Add spacing
    console.log("Test Case IDs should be encased in brackets. EX: [C1234567]");
    process.exit(1);
}

if (duplicateTestCaseIDs.size > 0) {
    console.log("Duplicate Test Case IDs were found for the following tests:");
    duplicateTestCaseIDs.forEach((tests) => {
        tests.forEach(({ file, lineNumber, testName }) => {
            console.log(`  ${file}:${lineNumber + 1} - ${testName}`);
        });
    });
    process.exit(1);
}

console.log("All tests have valid and unique Test Case IDs.");
