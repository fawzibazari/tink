import { AxiosError } from 'axios';
import { Request, Response, Router } from 'express';
import { authenticateToken } from '../middlewares/jwt';
import { TinkObject, TinkUserObject } from '../utils/tools';
export const transactions = Router();
import moment from 'moment-timezone';

transactions.post(
  '/list-transactions',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const months_to_include = req.body.months_to_include;
      const beginnigDate = req.body.beginnigDate;
      const endDate = req.body.endDate;
      const externalUserId = req.body.externalUserId;
      const all = req.body.all;
      const userCode = await TinkObject.UserCode(externalUserId);
      await TinkUserObject.UserAccessToken(userCode);
      const date_to_begin_from =
        months_to_include == undefined
          ? moment()
              .tz('Europe/Paris', false)
              .subtract(3, 'months')
              .format('YYYY-MM-DD')
          : moment()
              .tz('Europe/Paris', false)
              .subtract(months_to_include, 'months')
              .format('YYYY-MM-DD');
      const list_transactions = await TinkUserObject.Transactions({
        isBooked: true,
        beginnigDate: all == true ? '' : beginnigDate ?? date_to_begin_from,
        endDate: endDate ?? '',
      });
      res.send(list_transactions);
    } catch (error) {
      console.log(error);

      const err = error as AxiosError;
      res.sendStatus(err.response?.status as number);
    }
  },
);

transactions.post(
  '/list-transactions-with-token',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      if (req.body.userToken != undefined) {
        const list_transactions = await TinkUserObject.Transactions({
          isBooked: true,
          userToken: req.body.userToken,
        });
        res.send(list_transactions);
      } else {
        res.sendStatus(400);
      }
    } catch (error) {
      const err = error as AxiosError;
      res.sendStatus(err.response?.status as number);
    }
  },
);

transactions.post(
  '/transactions-by-account',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const externalUserId = req.body.externalUserId;
      const accountId = req.body.accountId;
      const userCode = await TinkObject.UserCode(externalUserId);
      await TinkUserObject.UserAccessToken(userCode);
      const list_transactions = await TinkUserObject.Transactions({
        accountId: accountId,
        // beginnigDate: '2023-02-28',
        isBooked: true,
      });
      res.send(list_transactions);
    } catch (error) {
      const err = error as AxiosError;
      res.sendStatus(err.response?.status as number);
    }
  },
);
