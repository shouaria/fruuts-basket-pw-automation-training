import { Download, Locator, Page, expect } from "@playwright/test";
import * as fs from "fs";
import { Step } from "e2e/support/steps";

export type DownloadType = "download the file" | "export CSV" | "export Excel";

export const genericSteps = (page: Page) => {
    return {
        WHEN: (prefix: "WHEN" | "AND" = "WHEN") => {
            return {
                // Must declare const newWindow = await.steps.WHEN["I am on a new browser window"]
                // when calling this step to use newWindow in other steps
                "I am on a new browser window": async () => {
                    return Step(prefix, "I am on a new browser window", async () => {
                        const newWindow = await page.waitForEvent("popup");
                        await newWindow.waitForLoadState();
                        return newWindow;
                    });
                },
                // Must declare const newDownload = await.steps.WHEN["I choose to (download the file|export CSV|export Excel) for (<customString>)"]
                // when calling this step to use newDownload in other steps
                "I choose to (download the file|export CSV|export Excel) for (<customString>)": async (downloadType: DownloadType, customString: string, locator: Locator) => {
                    return Step(prefix, `I choose to ${downloadType} for ${customString}`, async () => {
                        const newDownload = page.waitForEvent("download");
                        await locator.click();
                        return newDownload;
                    });
                },
            };
        },

        THEN: (prefix: "THEN" | "AND" = "THEN") => {
            return {
                "I see the file was downloaded": async (fileName: string, newDownload: Download) => {
                    await Step(prefix, "I see the file was downloaded", async () => {
                        const suggestedFileName = newDownload.suggestedFilename();
                        const filePath = `download/${suggestedFileName}`;
                        await newDownload.saveAs(filePath);
                        try {
                            expect(fs.existsSync(filePath)).toBeTruthy(); // checks that the statement was successfully downloaded
                            expect(fs.statSync(filePath).size).toBeGreaterThan(0); // checks that the file size is not zero
                            expect(suggestedFileName).toBe(fileName); // checks that correct statement was downloaded
                        } finally {
                            // Deletes the downloaded file
                            if (fs.existsSync(filePath)) {
                                fs.unlinkSync(filePath);
                            }
                        }
                    });
                },
            };
        },
    };
};
