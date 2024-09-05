import { expect } from "@playwright/test";
import { BasePage } from "./base/base.page";
import { AllFruits } from "../types/fruits";

export class FruitProductPage extends BasePage {
    URL = "product-page";

    get elements() {
        return {
            ...super.elements,
            PAGE_HEADING: this.page.locator("[data-hook='product - title']"),
            HOME_LINK: this.page.getByRole("link", { name: "Home", exact: true }),
            ADD_TO_CART_BUTTON: this.page.getByRole("link", { name: "Add to Cart", exact: true }),
            BUY_NOW_BUTTON: this.page.getByRole("link", { name: "Buy Now", exact: true }),
        };
    }

    async goTo(fruitProductPage?: AllFruits) {
        if (fruitProductPage === undefined) {
            await this.page.goto(this.URL);
        } else {
            const formattedURL = fruitProductPage.toLowerCase().split(" ").join("-");
            await this.page.goto(`${this.URL}/${formattedURL}`);
        }
    }

    async expectToBeOpen(secondaryHeading?: AllFruits) {
        if (secondaryHeading === undefined) {
            await expect(this.elements.PAGE_HEADING).toBeVisible();
        } else {
            await expect(this.page.getByRole("heading", { name: secondaryHeading })).toBeVisible();
        }
    }

    async expectToHaveCorrectURL(secondaryURL?: AllFruits) {
        if (secondaryURL === undefined) {
            expect(this.page.url()).toContain(this.URL);
        } else {
            const formattedURL = secondaryURL.toLowerCase().split(" ").join("-");
            expect(this.page.url()).toContain(formattedURL);
        }
    }

    async assertFruitDetails(fruit: AllFruits) {
        switch (fruit) {
            case "Blueberry Burst":
                await expect(this.page.getByText("Rich and flavorful blueberries")).toBeVisible();
                break;

            case "Exotic Pineapple":
                await expect(this.page.getByText("Sweet and juicy pineapple")).toBeVisible();
                break;
            default:
                break;
        }
    }
}
