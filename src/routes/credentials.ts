import { AxiosError } from 'axios';
import { Request, Response, Router } from 'express';
import { authenticateToken } from '../middlewares/jwt';
import { TinkObject, TinkUserObject } from '../utils/tools';

export const credentials = Router();

credentials.post(
  '/list-credentials',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const externalUserId = req.body.externalUserId;
      const userCode = await TinkObject.UserCode(externalUserId);
      await TinkUserObject.UserAccessToken(userCode);
      const list_credentials = await TinkUserObject.ListCredentials();
      res.send(list_credentials);
    } catch (error) {
      const err = error as AxiosError;
      res.sendStatus(err.response?.status as number);
    }
  },
);

credentials.post(
  '/credential-id',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const externalUserId = req.body.externalUserId;
      const credential_Id = req.body.credential_Id;
      const userCode = await TinkObject.UserCode(externalUserId);
      await TinkUserObject.UserAccessToken(userCode);
      const list_credentials =
        await TinkUserObject.ProviderConsentsByCredentialId(credential_Id);
      res.send(list_credentials);
    } catch (error) {
      const err = error as AxiosError;
      res.sendStatus(err.response?.status as number);
    }
  },
);
