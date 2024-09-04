import { test as base, Page } from "@playwright/test";
import { homePageSteps } from "e2e/support/step-definitions/homePage.steps";
import { genericSteps } from "./step-definitions/generic.steps";
import { combinedSteps } from "./step-definitions/combined.steps";

/**
 * This spreads all steps and exports them to easily be accessible
 */

export class Steps {
    constructor(private page: Page) {
        this.page = page;
    }

    get GIVEN() {
        return { ...homePageSteps(this.page).GIVEN(), ...combinedSteps(this.page).GIVEN() };
    }

    get WHEN() {
        return {
            ...genericSteps(this.page).WHEN(),
            ...homePageSteps(this.page).WHEN(),
            ...combinedSteps(this.page).WHEN(),
        };
    }

    get THEN() {
        return {
            ...genericSteps(this.page).THEN(),
            ...homePageSteps(this.page).THEN(),
            ...combinedSteps(this.page).THEN(),
        };
    }

    get AND() {
        return {
            ...genericSteps(this.page).WHEN("AND"),
            ...genericSteps(this.page).THEN("AND"),
            ...homePageSteps(this.page).WHEN("AND"),
            ...homePageSteps(this.page).THEN("AND"),
            ...combinedSteps(this.page).WHEN("AND"),
            ...combinedSteps(this.page).THEN("AND"),
        };
    }
}

// Renames test to Scenario and allows above Steps class to
// be passed through as a fixture inside a Scenario.
export type StepFixture = {
    steps: Steps;
};

export const { expect } = base;

export const Scenario = base.extend<StepFixture>({
    steps: async ({ page }, use) => {
        const steps = new Steps(page);
        await use(steps);
    },
});

// To be used inside step files to have reports use step names
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function Step(prefix: string, description: string, callback: any) {
    await Scenario.step(`${prefix} ${description}`, callback);
}
