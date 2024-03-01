import { AxiosError } from "axios";
import { config as dotenvConfig } from "dotenv";
import { TinkConnector, User } from "./tink/tink";

dotenvConfig();

//tink
const TinkObject = new TinkConnector();
const TinkUserObject = new User();

// const link =  TinkObject.ClientAccessToken().then(() =>
// TinkObject.createUser(id).then(() =>
//   TinkObject.DelegateCode(id, fullname).then(() =>
//     TinkObject.TinkLink(options),
//   ),
// ),
// );