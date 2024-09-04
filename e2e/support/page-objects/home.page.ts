import { AllFruits } from "../types/fruits";
import { BasePage } from "./base/base.page";

export class HomePage extends BasePage {
    URL = "/"; // same as baseURL in config (can't import that here)

    get sections() {
        return {
            FRUIT_SLIDER_SECTION: this.page.getByRole("group").filter({ hasText: "Blueberry" }),
        };
    }

    get elements() {
        return {
            ...super.elements,
            PAGE_HEADING: this.page.getByRole("heading", { name: "Our Selection" }),
        };
    }

    async proceedToViewDetailsForFruit(fruitName: AllFruits) {
        await this.sections.FRUIT_SLIDER_SECTION.getByRole("link", {
            name: fruitName,
        }).click();
    }
}
