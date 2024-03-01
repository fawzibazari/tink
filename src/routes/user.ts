import { AxiosError } from 'axios';
import { Request, Response, Router } from 'express';
import { authenticateToken } from '../middlewares/jwt';
import { TinkObject, TinkUserObject } from '../utils/tools';

export const user = Router();

user.post('/link', async (req: Request, res: Response) => {
  const id = req.body.id;
  const firstname = req.body.firstname;
  const lastname = req.body.lastname;
  const options = req.body.options;
  const fullname = firstname + ' ' + lastname;
  const link = await TinkObject.ClientAccessToken().then(() =>
    TinkObject.createUser(id).then(() =>
      TinkObject.DelegateCode(id, fullname).then(() =>
        TinkObject.TinkLink(options),
      ),
    ),
  );
  res.send({ tink_link: link });
});

user.get('/callback', async (req: Request, res: Response) => {
  try {
    res.send(
      '<iframe width="560" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
    );
  } catch (error) {
    console.log(error);
    res.sendStatus(404);
  }
});

user.post(
  '/getuser',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const externalUserId = req.body.externalUserId;
      const userCode = await TinkObject.UserCode(externalUserId);
      await TinkUserObject.UserAccessToken(userCode);
      const user = await TinkUserObject.getUser();
      res.send(user);
    } catch (error) {
      const err = error as AxiosError;
      res.sendStatus(err.response?.status as number);
    }
  },
);

user.post(
  '/deleteuser',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const externalUserId = req.body.externalUserId;
      const userCode = await TinkObject.UserCode(externalUserId);
      await TinkUserObject.UserAccessToken(userCode);
      await TinkUserObject.deleteUser();
      res.send('user deleted with success');
    } catch (error) {
      const err = error as AxiosError;
      res.sendStatus(err.response?.status as number);
    }
  },
);
