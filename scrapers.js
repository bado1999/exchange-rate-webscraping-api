import { launch } from "puppeteer";

async function scrapeTapTapSendRates() {
  const url = "https://www.taptapsend.com";
  const browser = await launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "networkidle2" });

    // Wait for the "from" currency dropdown to load
    await page.waitForSelector("#origin-currency");

    // Get all available "from" currency options
    const fromCurrencies = await page.evaluate(() => {
      const options = Array.from(
        document.querySelectorAll("#origin-currency option")
      );

      return options.map((option) => ({
        value: option.value,
        name: option.textContent.trim(),
      }));
    });

    //console.log("FromCurrencies", fromCurrencies);

    const exchangeRates = [];

    // Loop through each "from" currency
    for (const fromCurrency of fromCurrencies) {
      await page.select("#origin-currency", fromCurrency.value);
      // Wait for the "to" currency dropdown to load
      await new Promise((r) => setTimeout(r, 2000));

      // Get all available "to" currency options
      const toCurrencies = await page.evaluate(() => {
        const options = Array.from(
          document.querySelectorAll("#destination-currency option")
        ); // Update selector

        return options.map((option) => ({
          value: option.value,
          name: option.textContent.trim(),
        }));
      });

      //console.log("ToCurrencies", toCurrencies);

      // Loop through each "to" currency and get the exchange rate
      for (const toCurrency of toCurrencies) {
        await page.select("#destination-currency", toCurrency.value);

        // Wait for the exchange rate to update
        await new Promise((r) => setTimeout(r, 2000));

        // Extract the exchange rate displayed
        const rate = await page.evaluate(() => {
          const rateElement = document.querySelector("#destination-amount");
          return rateElement ? rateElement.value : null;
        });

        if (rate) {
          exchangeRates.push({
            fromCurrency:
              fromCurrency.value == "FCFA" ? "XOF" : fromCurrency.value,
            toCurrency: toCurrency.value == "FCFA" ? "XOF" : toCurrency.value,
            rate: rate,
          });
          console.log(
            `FromCurrency: ${fromCurrency.name}, ToCurrency: ${toCurrency.name}, Exchange Rate: ${rate}`
          );
        }
      }
    }

    return exchangeRates;
  } catch (error) {
    console.error(error);
    throw new Error("Error scraping TapTapSend rates");
  } finally {
    await browser.close();
  }
}

async function scrapeGandyamPayRates() {
  const url = "https://gandyampay.com/";
  const browser = await launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "networkidle2" });

    // Click the "Show" button to reveal the listbox
    await page.waitForSelector("#rfs-btn");

    await page.click("#rfs-btn");

    const exchangeRates = [];

    // Wait for the listbox and get updated "to" currencies each iteration
    await page.waitForSelector('[role="listbox"] > li');
    const currenciesLength = (await page.$$('[role="listbox"] > li')).length;

    //Click the "Close" button to reveal the listbox
    await page.click("#rfs-btn");

    for (let i = 0; i < currenciesLength; i++) {
      // Click the "Show" button to reveal the listbox
      await page.click("#rfs-btn");
      // Wait for the listbox and get updated "to" currencies each iteration
      await page.waitForSelector('[role="listbox"] > li');
      const toCurrencies = await page.$$('[role="listbox"] > li');
      try {
        // Click to select "to" currency
        await toCurrencies[i].click();

        // Wait for the exchange rate to update
        await new Promise((r) => setTimeout(r, 1000));

        // Extract the exchange rate and currency name
        const rateInfo = await page.evaluate(() => {
          const rateElement = document.querySelector(
            "#root > div:nth-of-type(3) > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3) > div:nth-of-type(1) > p:nth-of-type(2)"
          );
          if (!rateElement) return null;
          const textParts = rateElement.textContent.trim().split(" ");
          return { rate: textParts[0], toCurrency: textParts[1] };
        });

        if (rateInfo && rateInfo.toCurrency !== "XOF") {
          exchangeRates.push({
            fromCurrency: "XOF",
            toCurrency: rateInfo.toCurrency,
            rate: rateInfo.rate,
          });
          console.log(
            `FromCurrency: XOF, ToCurrency: ${rateInfo.toCurrency}, Exchange Rate: ${rateInfo.rate}`
          );
        }
      } catch (innerError) {
        console.error(error);
        throw new Error("Error scrapping GandyamPay rates");
      }
    }

    return exchangeRates;
  } catch (error) {
    console.error(error);
    throw new Error("Error scrapping GandyamPay rates");
  } finally {
    await browser.close();
  }
}

export { scrapeTapTapSendRates, scrapeGandyamPayRates };
