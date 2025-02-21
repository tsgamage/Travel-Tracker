import express, { query } from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const db = new pg.Client({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
});

db.connect();

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function getVisitedCountries() {
  let countryArray = new Array();
  const visitedCountriesResult = await db.query(
    "SELECT country_code FROM visited_countries;"
  );
  visitedCountriesResult.rows.forEach((row) => {
    countryArray.push(row["country_code"]);
  });
  return countryArray;
}

app.get("/", async (req, res) => {
  let visitedCountries = await getVisitedCountries();
  res.render("index.ejs", {
    countries: visitedCountries,
    total: visitedCountries.length,
  });
});

app.post("/add", async (req, res) => {
  let userInput = req.body["country"].toLowerCase();

  // Checks if user entered a value to input field or not
  if (userInput.length > 1) {
    let newCountryCode = "LK";
    try {
      // Try to run SQL code for catch any errors
      const getCountryCode = await db.query(
        "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",
        [userInput]
      );
      // if SQL code runs properly assigning result value to variable
      newCountryCode = getCountryCode.rows[0].country_code;
    } catch (error) {
      // if SQL query gives an error print that error message and handle it
      console.log(error);
      let visitedCountries = await getVisitedCountries();
      res.render("index.ejs", {
        countries: visitedCountries,
        total: visitedCountries.length,
        error: "Please Check Your Spellings and try again",
      });
    }

    try {
      await db.query("INSERT INTO visited_countries (country_code) VALUES ($1);", [
        newCountryCode,
      ]);
      res.redirect("/");
    } catch (error) {
      console.log(error);
      let visitedCountries = await getVisitedCountries();
      res.render("index.ejs", {
        countries: visitedCountries,
        total: visitedCountries.length,
        error: "Country already Added",
      });
    }

    // res.send("Hello Princess");
  } else {
    res.redirect("/");
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
