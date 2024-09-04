import { expect, Locator, Page } from "@playwright/test";

/**
 * Master page class containing all methods, locators and functionality
 * that is shared across all other page classes
 */
export class BasePage {
    constructor(public page: Page) {
        this.page = page;
    }

    URL = undefined as unknown as string;

    CLASS_NAME = this.constructor.name;

    /** A collection of expected base page elements */
    get elements() {
        return {
            PAGE_HEADING: undefined as unknown as Locator,
            SEARCHBOX: this.page.getByRole("searchbox", { name: "Search..." }),
        };
    }

    async goTo() {
        await this.page.goto("");
    }

    // Assertion Methods ----------------------------------------

    /** 'secondaryHeading' option should have custom defined parameter and method for respective sub-classes */
    async expectToBeOpen(secondaryHeading?: string) {
        this.assertLocator("PAGE_HEADING");
        if (secondaryHeading === undefined) {
            await expect(this.elements.PAGE_HEADING).toBeVisible();
        }
    }

    /** 'secondaryURL' option should have custom defined parameter and method for respective sub-classes */
    async expectToHaveCorrectURL(secondaryURL?: string) {
        this.assertURL();
        if (secondaryURL === undefined) {
            expect(this.page.url()).toContain(this.URL);
        } else {
            throw new Error(`No secondary URL property was defined for '${secondaryURL}' in ${this.CLASS_NAME} class`);
        }
    }

    private assertLocator(key: keyof typeof this.elements) {
        if (!this.elements[key]) {
            throw new Error(`Locator for ${key} missing from ${this.CLASS_NAME} class 'elements'`);
        }
    }

    private assertURL() {
        if (!this.URL) {
            throw new Error(`No 'URL' property or string value found in ${this.CLASS_NAME} class properties`);
        }
    }
}
