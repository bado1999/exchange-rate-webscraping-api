import sqlite3 from "sqlite3";
import { connectToDB, closeDBConnection } from "./dbUtils.js";
function initDB() {
  // Connect to SQLite database (creates a new file if it doesn't exist)
  const db = connectToDB();

  // Create refresher table
  db.run(
    `
  CREATE TABLE IF NOT EXISTS refresher (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    last_refresh INTEGER NOT NULL
  )
`,
    (err) => {
      if (err) console.error("Error creating refresher table:", err.message);
      else {
        console.log("Refresher table created");
      }
    }
  );

  // Create tables
  db.serialize(() => {
    // Create Companies table
    db.run(
      `
    CREATE TABLE IF NOT EXISTS companies (
      company_id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_name TEXT UNIQUE NOT NULL
    )
  `,
      (err) => {
        if (err) console.error("Error creating companies table:", err.message);
        else {
          console.log("Companies table created");

          // Insert companies after table creation
          const companies = [
            "TapTap Send",
            "Gandyam Pay",
            "Ria Money Transfer",
          ];
          const stmt = db.prepare(
            "INSERT OR IGNORE INTO companies (company_name) VALUES (?)"
          );

          companies.forEach((company) => {
            stmt.run(company, (err) => {
              if (err) {
                console.error(`Error inserting ${company}:`, err.message);
              } else {
                console.log(`${company} inserted successfully.`);
              }
            });
          });

          stmt.finalize();
        }
      }
    );

    // Create Exchange Rates table
    db.run(
      `
    CREATE TABLE IF NOT EXISTS exchange_rates (
      rate_id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      from_currency INTEGER NOT NULL,
      to_currency INTEGER NOT NULL,
      exchange_rate REAL NOT NULL,
      UNIQUE (company_id, from_currency, to_currency),
      FOREIGN KEY (company_id) REFERENCES companies(company_id)
    )
  `,
      (err) => {
        if (err)
          console.error("Error creating exchange_rates table:", err.message);
        else console.log("Exchange Rates table created");

        // Close the database connection
        closeDBConnection(db);
      }
    );
  });
}

export { initDB };
