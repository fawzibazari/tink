import { Request, Response, Router } from 'express';
import { generateAccessToken } from '../middlewares/jwt';
import { USER_CREDENTIALS } from '../utils/tools';

export const auth = Router();

auth.post('/login', async function (req: Request, res: Response) {
  if (req.body.username !== USER_CREDENTIALS.username) {
    res.status(401).send('invalid credentials');
    return;
  }
  if (req.body.password !== USER_CREDENTIALS.password) {
    res.status(401).send('invalid credentials');
    return;
  }

  const accessToken = generateAccessToken(USER_CREDENTIALS);
  res.send({
    accessToken,
  });
});
