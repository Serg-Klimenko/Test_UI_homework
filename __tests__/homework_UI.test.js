const playwright = require('playwright');

jest.setTimeout(120000);

let browser;
let context;
let page;

beforeAll(async () => {
    browser = await playwright.chromium.launch({headless: false, slowMo: 1000});
})

beforeEach(async () => {
    context = await browser.newContext();
    page = await context.newPage();
})

afterEach(async () => {
    await context.close();
})

afterAll(async () => {
    await browser.close();
})

describe("UI test homework", () => {
    test("1. iFrame test", async () => {
        await page.goto("https://the-internet.herokuapp.com/iframe");
        const frames = await page.frames();
        const frame1 = frames[0];
        await frame1.press("#mce_0_ifr","Enter");
        await frame1.press("#mce_0_ifr","1");
        await page.click("div#mceu_6>button");
        await frame1.press("#mce_0_ifr","Enter");
        await page.click("div#mceu_3>button");
        await frame1.press("#mce_0_ifr","2");
        await frame1.press("#mce_0_ifr","Enter");
    });

    test("2. Load litecoin page from left menu", async () => {
        await page.goto("https://bitaps.com/");
        await page.waitForSelector(".btn-group");
        // Select Litecoin currency in the left dropdawn menu
        await page.click(".bitcoin-logo");
        await page.click(".litecoin-logo-gray");
        await page.waitForSelector(".litecoin-logo");
    });

    test("3. Switch dark/light mode", async () => {
        await page.goto("https://bitaps.com/");
        await page.waitForSelector(".theme");
        // Switch to dark mode
        await page.click(".theme");
        await page.waitForSelector('[data-theme="dark"]');
        // Return to light mode
        await page.click(".theme");
        await page.waitForSelector('[data-theme="light"]');
    });

    test("4. Select russian language", async () => {
        await page.goto("https://bitaps.com/");
        await page.waitForSelector("#footer");
        // Click to "Russian" link and compare field's value 
        await page.click("div.col-sm-3:nth-child(3) > div:nth-child(3) > a:nth-child(1)");
        await page.waitForSelector("#last_block_header");
        const result = await page.$eval("p.lattolight:first-child", el => el.innerText);
        expect(result).toBe("Последний блок");
    });

    test("5. Search block by number in the search field", async () => {
        await page.goto("https://bitaps.com/");
        await page.waitForSelector(".input-box");
        const blockNumber = 1;
        // Input block number in the search field
        await page.fill(".input-box", blockNumber.toString());
        await page.click("span.fa:nth-child(2)");
        // Wait page with result
        await page.waitForSelector("div#block");
        // Compare search result with block number
        const result = await page.$eval("div#block-number", el => el.innerText);
        expect(Number(result)).toEqual(blockNumber);
    });

    test("6. Generate key in the BIP32 calculator, copy key to clipboard and compare keys", async () => {
        // Set permission to read clipboard in browser
        await context.grantPermissions(['clipboard-read']);
        await page.goto("https://bitaps.com/bip32");
        await page.waitForSelector("div#gen-tool");
        // Generate key (button Generate)
        await page.click("div#gen-tool");
        await page.click("i.btn-copy:nth-child(3)");
        // Copy key to clipboard (button Copy)
        const clipboardValue = await page.evaluate(async (clipboard) => {
            return await navigator.clipboard.readText();
        });
        const keyValue = await page.$eval("div#bip32-key", el => el.innerText);
        // Compare value from Input field with key from clipboard
        expect(keyValue).toEqual(clipboardValue);
    });

    test("*. Activate/deactivate camera for qr-code", async () => {
        // Set permission for launch camera
        await context.grantPermissions(['camera']);
        page = await context.newPage();
        await page.goto("https://bitaps.com/");
        await page.waitForSelector(".scan-qr");
        // Activate camera
        await page.click(".scan-qr");
        await page.waitForSelector("#search-bar-canvas");
        // Close camera
        await page.click("#search-bar-camera-close");
        await page.waitForSelector("search-bar-qr-scanner",{state: "hidden"});
    });
}) 