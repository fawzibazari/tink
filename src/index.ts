import { config as dotenvConfig } from "dotenv";
import { TinkConnector, User } from "./tink";

dotenvConfig();

//tink
const TinkObject = new TinkConnector();
const TinkUserObject = new User();
