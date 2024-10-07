import { Scenario } from "e2e/support/steps";

Scenario.describe(
    "See a fruit's details",
    {
        annotation: {
            type: "Feature",
            description: "As a user, I want to be able to see details about a fruit before I buy it",
        },
    },
    () => {
        Scenario("User is able to return to the home page after viewing a fruit's details", async ({ steps }) => {
            await steps.GIVEN["I am on the <fruitName> product page"]("Blueberry Burst");
            await steps.WHEN["I return to the Fruuts Basket home page"]();
            await steps.THEN["I am on the home page"]();
        });
    }
);
