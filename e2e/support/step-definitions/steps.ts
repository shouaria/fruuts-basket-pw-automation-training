import { test as base, Page } from "@playwright/test";
import { homePageSteps } from "e2e/support/step-definitions/homePage.steps";
import { genericSteps } from "./generic.steps";
import { fruitProductPageSteps } from "./fruitProductPage.steps";

/**
 * This spreads all steps and exports them to easily be accessible
 */

export class Steps {
    constructor(private page: Page) {
        this.page = page;
    }

    get GIVEN() {
        return {
            ...fruitProductPageSteps(this.page).GIVEN(),
            ...homePageSteps(this.page).GIVEN(),
        };
    }

    get WHEN() {
        return {
            ...fruitProductPageSteps(this.page).WHEN(),
            ...genericSteps(this.page).WHEN(),
            ...homePageSteps(this.page).WHEN(),
        };
    }

    get THEN() {
        return {
            ...fruitProductPageSteps(this.page).THEN(),
            ...genericSteps(this.page).THEN(),
            ...homePageSteps(this.page).THEN(),
        };
    }

    get AND() {
        return {
            ...fruitProductPageSteps(this.page).THEN("AND"),
            ...fruitProductPageSteps(this.page).WHEN("AND"),
            ...genericSteps(this.page).THEN("AND"),
            ...genericSteps(this.page).WHEN("AND"),
            ...homePageSteps(this.page).THEN("AND"),
            ...homePageSteps(this.page).WHEN("AND"),
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
export async function Step<T>(prefix: GivenPrefix | WhenPrefix | ThenPrefix, description: string, callback: () => Promise<T>): Promise<T> {
    return Scenario.step(`${prefix} ${description}`, callback);
}

export type GivenPrefix = "GIVEN" | "AND";
export const GIVEN_PREFIX = "GIVEN";
export type WhenPrefix = "WHEN" | "AND";
export const WHEN_PREFIX = "WHEN";
export type ThenPrefix = "THEN" | "AND";
export const THEN_PREFIX = "THEN";
