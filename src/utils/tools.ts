import { config as dotenvConfig } from 'dotenv';
import * as redis from 'redis';
import { TinkConnector, User } from '../tink/tink';

dotenvConfig();

//tink
export const TinkObject = new TinkConnector();
export const TinkUserObject = new User();

//redis
export const redisClientAccount = redis.createClient({
  socket: {
    host: process.env.REDISHOST || 'localhost',
    port: Number(process.env.REDISPORT) || 6379,
  },
});

export function mostRecentDate(array: Date[] | any) {
  const maxDate = new Date(
    Math.max.apply(
      null,
      array.map(function (e: { sessionExpiryDate: string | number | Date }) {
        return new Date(e.sessionExpiryDate);
      }),
    ),
  );
  return maxDate;
}

export const timer = (ms: number) => new Promise((res) => setTimeout(res, ms));

// jwt user
export const JWT_ACCESS_TOKEN_SECRET = process.env
  .JWT_ACCESS_TOKEN_SECRET as string;
const USERNAME = process.env.USERNAME as string;
const PASSWORD = process.env.PASSWORD as string;
export const USER_CREDENTIALS = {
  username: USERNAME,
  password: PASSWORD,
};
