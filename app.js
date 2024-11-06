import { initDB } from "./initdb.js";
import { scrapeTapTapSendRates } from "./scrapers.js";
import axios from "axios";

//initDB();

scrapeTapTapSendRates();
