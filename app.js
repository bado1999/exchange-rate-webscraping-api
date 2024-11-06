import { initDB } from "./initdb.js";
import { scrapeTapTapSendRates, scrapeGandyamPayRates } from "./scrapers.js";
import { connectToDB, closeDBConnection } from "./dbUtils.js";
import http from "http";
import { console } from "inspector";

initDB();

//Refresh exchange rates
async function refresh() {
  let tapTapSendRates = await scrapeTapTapSendRates();

  let gandyamPayRates = await scrapeGandyamPayRates();

  // Connect to SQLite database (creates a new file if it doesn't exist)
  const db = connectToDB();

  const stmt = db.prepare(
    "INSERT INTO exchange_rates (company_id, from_currency, to_currency, exchange_rate) VALUES (?, ?, ?, ?) ON CONFLICT(company_id, from_currency, to_currency) DO UPDATE SET exchange_rate = ?"
  );

  //insert tapTapSend rates into db
  insertRates(stmt, tapTapSendRates, 1);

  //insert gandyamPay rates into db
  insertRates(stmt, gandyamPayRates, 2);

  stmt.finalize();
  // Close the database connection
  closeDBConnection(db);

  setupRefresher();
}

// Insert exchange rates into the database
function insertRates(stmt, rates, companyID) {
  for (const rate of rates) {
    stmt.run(
      companyID,
      rate.fromCurrency,
      rate.toCurrency,
      rate.rate,
      rate.rate,
      function (err) {
        if (err) {
          console.error("Error inserting exchange rates:", err.message);
        } else {
          console.log("Exchange rate inserted successfully");
        }
      }
    );
  }
}
// Get all exchange rates from the database
function getRates() {
  return new Promise((resolve, reject) => {
    const db = connectToDB();

    console.log("Fetching Rates");

    db.all(
      `SELECT from_currency, to_currency, exchange_rate, company_name FROM exchange_rates JOIN companies ON exchange_rates.company_id = companies.company_id`,
      (err, rows) => {
        if (err) {
          console.error("Error querying exchange rates:", err.message);
          reject(err); // Reject the promise on error
        } else {
          console.log("Rates fetched successfully");
          resolve(rows); // Resolve the promise with the data
        }

        // Close the database connection
        closeDBConnection(db);
      }
    );
  });
}

function getRefresher() {
  return new Promise((resolve, reject) => {
    const db = connectToDB();

    console.log("Fetching Refresher");
    db.all(`SELECT last_refresh FROM refresher`, (err, row) => {
      if (err) {
        console.error("Error querying refresher:", err.message);
        reject(err); // Reject the promise on error
      } else {
        console.log("Refresher fetched successfully");
        if (row.length === 0) {
          resolve(null);
        } else resolve(row[0].last_refresh); // Resolve the promise with the data
      }
      // Close the database connection
      closeDBConnection(db);
    });
  });
}

// Refresh after 1 hour
let refreshAfter = 60 * 60 * 1000;

// Check if exchange rates can be refreshed
async function canRefresh() {
  const last_refresh = await getRefresher();
  console.log("Refresher:", last_refresh);
  if (Date.now() - last_refresh >= refreshAfter) return true;
  return false;
}

// Update the refresher timestamp
function updateRefresher() {
  const db = connectToDB();
  const stmt = db.prepare("UPDATE refresher SET last_refresh = ? ");
  stmt.run(Date.now(), function (err) {
    if (err) {
      console.error("Error updating refresher:", err.message);
    } else {
      console.log("Refresher updated successfully");
    }
  });
  stmt.finalize();

  // Close the database connection
  closeDBConnection(db);
}

function setupRefresher() {
  const db = connectToDB();
  const stmt = db.prepare("INSERT INTO refresher (last_refresh) VALUES (?)");
  stmt.run(Date.now(), function (err) {
    if (err) {
      console.error("Error setting refresher:", err.message);
    } else {
      console.log("Refresher set successfully");
    }
  });
  stmt.finalize();
  closeDBConnection(db);
}

//Call refresh function to insert exchange rates for the first time
//refresh();

http
  .createServer(async (req, res) => {
    if (req.url === "/taux/refresh") {
      res.setHeader("Content-Type", "text/plain");
      try {
        let isRefreshable = await canRefresh();
        if (isRefreshable) {
          refresh();
          res.statusCode = 200;
          res.end("Refreshed\n");
          updateRefresher();
        } else {
          res.statusCode = 403;
          res.end("Forbidden\n");
        }
      } catch (error) {
        res.statusCode = 500;
        res.end("Error refreshing\n");
      }
    } else if (req.url === "/taux") {
      let rates;
      try {
        rates = await getRates();
        console.log(rates);
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(rates));
      } catch (error) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "text/plain");
        res.end("Error getting rates\n");
      }
    } else {
      res.statusCode = 404;
      res.setHeader("Content-Type", "text/plain");
      res.end("Not Found\n");
    }
  })
  .listen(8080);
