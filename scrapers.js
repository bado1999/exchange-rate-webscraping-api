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
      ); // Update selector
      return options.map((option) => ({
        value: option.value,
        name: option.textContent.trim(),
      }));
    });

    console.log("FromCurrencies", fromCurrencies);

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

      console.log("ToCurrencies", toCurrencies);

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
          to = fromCurrency.value.split("-")[1];
          from = toCurrency.value.split("-")[1];
          exchangeRates.push({
            fromCurrency: from == "FCFA" ? "XOF" : from,
            toCurrency: to == "FCFA" ? "XOF" : to,
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
    console.error("Error fetching exchange rates:", error);
  } finally {
    await browser.close();
  }
}

async function scrapeGandyamPayRates() {
  const url = "https://www.gandyampay.com";
  const browser = await launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "networkidle2" });

    //Click the "Show" button to reveal the listbox
    await page.waitForSelector("#rfs-btn");
    await page.click("#rfs-btn");

    // Wait for the "to" currency list to load
    await page.waitForSelector("[role='listbox'] > li");

    // Get all available "to" currency list items
    const toCurrencies = await page.$$("[role='listbox'] > li");

    const exchangeRates = {};

    // Loop through each "to" currency item
    for (const toCurrency of toCurrencies) {
      // Click to select "to" currency
      await toCurrency.click();

      // Wait for the exchange rate to update
      await new Promise((r) => setTimeout(r, 2000));

      // Extract the exchange rate displayed
      const rate = await page.evaluate(() => {
        const rateElement = document.querySelector(
          "#root > div:nth-child(3) > div:nth-child(1) > div:nth-child(2) > div:nth-child(2) > div:nth-child(1) > div:nth-child(2) > div:nth-child(3)div:nth-child(2) > p:nth-child(3)"
        );
        return rateElement ? rateElement.textContent.trim() : null;
      });

      // Get the "to" currency name
      const toCurrencyName = await toCurrency.evaluate((el) =>
        el.textContent.trim()
      );

      if (rate) {
        //exchangeRates[`${fromCurrency.name} to ${toCurrency.name}`] = rate;
        exchangeRates.push({
          fromCurrency: fromCurrency.value.split("-")[1],
          toCurrency: toCurrency.value.split("-")[1],
          rate: rate,
        });
        console.log(
          `FromCurrency: ${fromCurrency.name}, ToCurrency: ${toCurrency.name} Exchange Rate: ${rate}`
        );
      }
    }

    return exchangeRates;
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
  } finally {
    await browser.close();
  }
}

export { scrapeTapTapSendRates };
