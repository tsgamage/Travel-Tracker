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

async function  getVisitedCountries (){
  let countryArray = new Array()
  const visitedCountriesResult = await db.query("SELECT country_code FROM visited_countries")
  visitedCountriesResult.rows.forEach(row => {
    countryArray.push(row["country_code"])
  });
  return countryArray
}

app.get("/", async (req, res) => {

  console.log()
  let visitedCountries = await getVisitedCountries();
  res.render("index.ejs", {
    countries: visitedCountries,
    total: visitedCountries.length,
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
