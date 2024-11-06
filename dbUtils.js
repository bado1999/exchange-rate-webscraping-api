import sqlite3 from "sqlite3";

// Connect to SQLite database (creates a new file if it doesn't exist)
const connectToDB = () => {
  const db = new sqlite3.Database("./exchange_rates.db", (err) => {
    if (err) {
     console,log(err);
    }
    console.log("Connected to the SQLite database.");
  });

  return db;
};

//Close the database connection
const closeDBConnection = (db) => {
  db.close((err) => {
    if (err) {
     console.error(err);
    }
    console.log("Closed the database connection.");
  });
};
export { connectToDB, closeDBConnection };
