import sqlite3 from "sqlite3";

function initDB() {
  // Connect to SQLite database (creates a new file if it doesn't exist)
  const db = new sqlite3.Database("./exchange_rates.db", (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log("Connected to the SQLite database.");
  });

  // Create refresher table
  db.run(
    `
  CREATE TABLE IF NOT EXISTS refresher (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    last_updated TIMESTAMP NOT NULL
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
    // Create Currencies table
    db.run(
      `
    CREATE TABLE IF NOT EXISTS currencies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT UNIQUE NOT NULL
    )
  `,
      (err) => {
        if (err) console.error("Error creating currencies table:", err.message);
        else {
          console.log("Currencies table created");
          // Define currencies to be inserted
          const currencies = [
            { name: "Afghan Afghani", code: "AFN" },
            { name: "Albanian Lek", code: "ALL" },
            { name: "Algerian Dinar", code: "DZD" },
            { name: "Angolan Kwanza", code: "AOA" },
            { name: "Argentine Peso", code: "ARS" },
            { name: "Armenian Dram", code: "AMD" },
            { name: "Aruban Florin", code: "AWG" },
            { name: "Australian Dollar", code: "AUD" },
            { name: "Azerbaijani Manat", code: "AZN" },
            { name: "Bahamian Dollar", code: "BSD" },
            { name: "Bahraini Dinar", code: "BHD" },
            { name: "Bangladeshi Taka", code: "BDT" },
            { name: "Barbadian Dollar", code: "BBD" },
            { name: "Belarusian Ruble", code: "BYN" },
            { name: "Belize Dollar", code: "BZD" },
            { name: "Bermudian Dollar", code: "BMD" },
            { name: "Bhutanese Ngultrum", code: "BTN" },
            { name: "Bolivian Boliviano", code: "BOB" },
            { name: "Bosnia and Herzegovina Convertible Mark", code: "BAM" },
            { name: "Botswana Pula", code: "BWP" },
            { name: "Brazilian Real", code: "BRL" },
            { name: "Brunei Dollar", code: "BND" },
            { name: "Bulgarian Lev", code: "BGN" },
            { name: "Burundian Franc", code: "BIF" },
            { name: "Cambodian Riel", code: "KHR" },
            { name: "Canadian Dollar", code: "CAD" },
            { name: "Cape Verdean Escudo", code: "CVE" },
            { name: "Cayman Islands Dollar", code: "KYD" },
            { name: "Central African CFA Franc", code: "XAF" },
            { name: "CFP Franc", code: "XPF" },
            { name: "Chilean Peso", code: "CLP" },
            { name: "Chinese Yuan", code: "CNY" },
            { name: "Colombian Peso", code: "COP" },
            { name: "Comorian Franc", code: "KMF" },
            { name: "Congolese Franc", code: "CDF" },
            { name: "Costa Rican Colón", code: "CRC" },
            { name: "Croatian Kuna", code: "HRK" },
            { name: "Cuban Peso", code: "CUP" },
            { name: "Czech Koruna", code: "CZK" },
            { name: "Danish Krone", code: "DKK" },
            { name: "Djiboutian Franc", code: "DJF" },
            { name: "Dominican Peso", code: "DOP" },
            { name: "East Caribbean Dollar", code: "XCD" },
            { name: "Egyptian Pound", code: "EGP" },
            { name: "Eritrean Nakfa", code: "ERN" },
            { name: "Ethiopian Birr", code: "ETB" },
            { name: "Euro", code: "EUR" },
            { name: "Falkland Islands Pound", code: "FKP" },
            { name: "Fijian Dollar", code: "FJD" },
            { name: "Gambian Dalasi", code: "GMD" },
            { name: "Georgian Lari", code: "GEL" },
            { name: "Ghanaian Cedi", code: "GHS" },
            { name: "Gibraltar Pound", code: "GIP" },
            { name: "Guatemalan Quetzal", code: "GTQ" },
            { name: "Guinean Franc", code: "GNF" },
            { name: "Guyanese Dollar", code: "GYD" },
            { name: "Haitian Gourde", code: "HTG" },
            { name: "Honduran Lempira", code: "HNL" },
            { name: "Hong Kong Dollar", code: "HKD" },
            { name: "Hungarian Forint", code: "HUF" },
            { name: "Icelandic Króna", code: "ISK" },
            { name: "Indian Rupee", code: "INR" },
            { name: "Indonesian Rupiah", code: "IDR" },
            { name: "Iranian Rial", code: "IRR" },
            { name: "Iraqi Dinar", code: "IQD" },
            { name: "Israeli New Shekel", code: "ILS" },
            { name: "Jamaican Dollar", code: "JMD" },
            { name: "Japanese Yen", code: "JPY" },
            { name: "Jordanian Dinar", code: "JOD" },
            { name: "Kazakhstani Tenge", code: "KZT" },
            { name: "Kenyan Shilling", code: "KES" },
            { name: "Kuwaiti Dinar", code: "KWD" },
            { name: "Kyrgyzstani Som", code: "KGS" },
            { name: "Laotian Kip", code: "LAK" },
            { name: "Lebanese Pound", code: "LBP" },
            { name: "Lesotho Loti", code: "LSL" },
            { name: "Liberian Dollar", code: "LRD" },
            { name: "Libyan Dinar", code: "LYD" },
            { name: "Macanese Pataca", code: "MOP" },
            { name: "Macedonian Denar", code: "MKD" },
            { name: "Malagasy Ariary", code: "MGA" },
            { name: "Malawian Kwacha", code: "MWK" },
            { name: "Malaysian Ringgit", code: "MYR" },
            { name: "Maldivian Rufiyaa", code: "MVR" },
            { name: "Mauritanian Ouguiya", code: "MRU" },
            { name: "Mauritian Rupee", code: "MUR" },
            { name: "Mexican Peso", code: "MXN" },
            { name: "Moldovan Leu", code: "MDL" },
            { name: "Mongolian Tögrög", code: "MNT" },
            { name: "Moroccan Dirham", code: "MAD" },
            { name: "Mozambican Metical", code: "MZN" },
            { name: "Myanmar Kyat", code: "MMK" },
            { name: "Namibian Dollar", code: "NAD" },
            { name: "Nepalese Rupee", code: "NPR" },
            { name: "Netherlands Antillean Guilder", code: "ANG" },
            { name: "New Taiwan Dollar", code: "TWD" },
            { name: "New Zealand Dollar", code: "NZD" },
            { name: "Nicaraguan Córdoba", code: "NIO" },
            { name: "Nigerian Naira", code: "NGN" },
            { name: "North Korean Won", code: "KPW" },
            { name: "Norwegian Krone", code: "NOK" },
            { name: "Omani Rial", code: "OMR" },
            { name: "Pakistani Rupee", code: "PKR" },
            { name: "Panamanian Balboa", code: "PAB" },
            { name: "Papua New Guinean Kina", code: "PGK" },
            { name: "Paraguayan Guaraní", code: "PYG" },
            { name: "Peruvian Sol", code: "PEN" },
            { name: "Philippine Peso", code: "PHP" },
            { name: "Polish Złoty", code: "PLN" },
            { name: "Pound Sterling", code: "GBP" },
            { name: "Qatari Riyal", code: "QAR" },
            { name: "Romanian Leu", code: "RON" },
            { name: "Russian Ruble", code: "RUB" },
            { name: "Rwandan Franc", code: "RWF" },
            { name: "Saint Helena Pound", code: "SHP" },
            { name: "Salvadoran Colón", code: "SVC" },
            { name: "Samoan Tala", code: "WST" },
            { name: "San Marinese Sammarinese Lira", code: "SML" },
            { name: "Saudi Riyal", code: "SAR" },
            { name: "Serbian Dinar", code: "RSD" },
            { name: "Seychellois Rupee", code: "SCR" },
            { name: "Singapore Dollar", code: "SGD" },
            { name: "Solomon Islands Dollar", code: "AUD" },
            { name: "Somali Shilling", code: "SOS" },
            { name: "South African Rand", code: "ZAR" },
            { name: "South Korean Won", code: "KRW" },
            { name: "South Sudanese Pound", code: "SSP" },
            { name: "Spanish Peseta", code: "ESP" },
            { name: "Sri Lankan Rupee", code: "LKR" },
            { name: "Sudanese Pound", code: "SDG" },
            { name: "Surinamese Dollar", code: "SRD" },
            { name: "Swedish Krona", code: "SEK" },
            { name: "Swiss Franc", code: "CHF" },
            { name: "Syrian Pound", code: "SYP" },
            { name: "Tajikistani Somoni", code: "TJS" },
            { name: "Tanzanian Shilling", code: "TZS" },
            { name: "Thai Baht", code: "THB" },
            { name: "Tunisian Dinar", code: "TND" },
            { name: "Turkish Lira", code: "TRY" },
            { name: "Turkmenistani Manat", code: "TMT" },
            { name: "Ugandan Shilling", code: "UGX" },
            { name: "Ukrainian Hryvnia", code: "UAH" },
            { name: "United Arab Emirates Dirham", code: "AED" },
            { name: "United States Dollar", code: "USD" },
            { name: "Uruguayan Peso", code: "UYU" },
            { name: "Uzbekistani Som", code: "UZS" },
            { name: "Vanuatu Vatu", code: "VUV" },
            { name: "Venezuelan Bolívar", code: "VES" },
            { name: "Vietnamese Đồng", code: "VND" },
            { name: "Yemeni Rial", code: "YER" },
            { name: "Zambian Kwacha", code: "ZMW" },
            { name: "Zimbabwean Dollar", code: "ZWL" },
          ];
          // Insert currencies
          const stmt = db.prepare(
            `INSERT OR IGNORE INTO currencies (name, code) VALUES (?, ?)`
          );
          currencies.forEach((currency) => {
            stmt.run(currency.name, currency.code, (err) => {
              if (err) {
                console.error("Error inserting currency:", err.message);
              }
            });
          });
          stmt.finalize();

          // Query currencies to verify insertion
          db.each(`SELECT COUNT(*) FROM currencies`, (err, row) => {
            if (err) {
              console.error("Error querying currencies:", err.message);
            } else {
              console.log(row);
            }
          });
        }
      }
    );

    // Create Companies table
    db.run(
      `
    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
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
            "INSERT OR IGNORE INTO companies (name) VALUES (?)"
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

          db.each(`SELECT COUNT(*) FROM companies`, (err, row) => {
            if (err) {
              console.error("Error querying companies:", err.message);
            } else {
              console.log(row);
            }
          });
        }
      }
    );

    // Create Exchange Rates table
    db.run(
      `
    CREATE TABLE IF NOT EXISTS exchange_rates (
      rate_id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      currency_from INTEGER NOT NULL,
      currency_to INTEGER NOT NULL,
      exchange_rate REAL NOT NULL,
      FOREIGN KEY (company_id) REFERENCES companies(company_id),
      FOREIGN KEY (currency_from) REFERENCES currencies(currency_id),
      FOREIGN KEY (currency_to) REFERENCES currencies(currency_id)
    )
  `,
      (err) => {
        if (err)
          console.error("Error creating exchange_rates table:", err.message);
        else console.log("Exchange Rates table created");

        // Close the database connection
        db.close((err) => {
          if (err) {
            return console.error(err.message);
          }
          console.log("Closed the database connection.");
        });
      }
    );
  });
}

export { initDB };
