import axios, { AxiosError } from 'axios';
import { config as dotenvConfig } from 'dotenv';
import * as http from 'http';
import * as https from 'https';
import { TinkTransctionsParams } from './Interfaces/ITransactionsParams';

dotenvConfig();

interface AccessToken {
  tink_link: string;
  user_code?: string;
  delegate_code: string;
  credentials_id: string;
  user_access_token?: string;
  client_access_token?: string;
  readonly USER_ID?: string;
  readonly BASE_URL: string;
  readonly CLIENT_ID: string;
  readonly GRANT_TYPE: string;
  readonly CLIENT_SCOPE: string;
  readonly CLIENT_SECRET: string;
  readonly ACTOR_CLIENT_ID: string;
  readonly EXTERNAL_USER_ID?: string;

  Webhook(): Promise<string | undefined>;
  TinkLink(): Promise<string>;
  UpdateTinkLink(): Promise<string>;
  UserCode(external_user_id: string): Promise<string>;
  ClientAccessToken(): Promise<string>;
  DelegateCode(external: number, fullname: string): Promise<string>;
  createUser(external_user_id: string): Promise<string>;
  updateScopeAndRetrievetoken(scope: JSON): Promise<string>;
}

export class TinkConnector implements AccessToken {
  USER_ID?: string;
  BASE_URL!: string;
  user_code!: string;
  CLIENT_ID!: string;
  tink_link!: string;
  GRANT_TYPE!: string;
  USERS_SCOPES!: string;
  CLIENT_SCOPE!: string;
  delegate_code!: string;
  CLIENT_SECRET!: string;
  credentials_id!: string;
  ACTOR_CLIENT_ID!: string;
  EXTERNAL_USER_ID?: string;
  user_access_token!: string;
  client_access_token!: string;

  constructor() {
    this.BASE_URL = process.env.BASE_URL as string;
    this.CLIENT_ID = process.env.CLIENT_ID as string;
    this.CLIENT_SCOPE = process.env.CLIENT_SCOPES as string;
    this.USERS_SCOPES = process.env.USERS_SCOPES as string;
    this.CLIENT_SECRET = process.env.CLIENT_SECRET as string;
    this.ACTOR_CLIENT_ID = process.env.ACTOR_CLIENT_ID as string;
  }

  async ClientAccessToken() {
    const params = `client_id=${this.CLIENT_ID}&client_secret=${this.CLIENT_SECRET}&grant_type=client_credentials&scope=${this.CLIENT_SCOPE}`;
    const result = await axios.post(
      `${this.BASE_URL}/api/v1/oauth/token`,
      params,
    );
    const clientToken = `${result.data.token_type} ${result.data.access_token}`;
    this.client_access_token = clientToken;
    return clientToken;
  }

  async ErrorHandler(errorCode: number) {
    switch (errorCode) {
      case 401:
        await this.ClientAccessToken();
        break;
      case 404:
        break;
      default:
        'error was not defined by our Error handler';
        break;
    }
  }

  async createUser(external_user_id: string): Promise<string> {
    let userId;
    this.EXTERNAL_USER_ID = external_user_id;
    const params = {
      external_user_id: this.EXTERNAL_USER_ID,
      locale: 'en_US',
      market: 'FR',
    };
    const body = JSON.stringify(params);
    try {
      const data = await axios.post(
        `${this.BASE_URL}/api/v1/user/create`,
        body,
        {
          headers: {
            Authorization: this.client_access_token,
            'Content-Type': 'application/json',
          },
        },
      );
      userId = data.data.user_id;
      this.USER_ID = userId;
    } catch (error) {
      const err = error as AxiosError as unknown as any;
      console.log(err.response.data.errorMessage);
    }
    return 'userId';
  }

  async UserCode(external_user_id: string): Promise<string> {
    this.EXTERNAL_USER_ID = external_user_id;
    let code;
    const params = `external_user_id=${this.EXTERNAL_USER_ID}&scope=${this.USERS_SCOPES}`;
    try {
      const data = await axios.post(
        `${this.BASE_URL}/api/v1/oauth/authorization-grant`,
        params,
        {
          headers: {
            Authorization: this.client_access_token,
          },
          httpAgent: new http.Agent({ keepAlive: true }),
          httpsAgent: new https.Agent({ keepAlive: true }),
        },
      );
      code = data.data.code;
      this.user_code = code;
    } catch (error) {
      const err = error as AxiosError;
      console.log(err.code);

      if (err.code === 'ERR_HTTP_INVALID_HEADER_VALUE') {
        await this.ErrorHandler(401);
        return await this.UserCode(this.EXTERNAL_USER_ID);
      }
      if (err.response) {
        if (err.response?.status === 401) {
          await this.ErrorHandler(err.response?.status);
          return await this.UserCode(this.EXTERNAL_USER_ID);
        }
      }
    }
    return code;
  }

  async DelegateCode(external: number, fullname: string) {
    const params = `actor_client_id=${this.ACTOR_CLIENT_ID}&external_user_id=${external}&scope=${this.USERS_SCOPES}&id_hint=${fullname}`;
    try {
      const data = await axios.post(
        `${this.BASE_URL}/api/v1/oauth/authorization-grant/delegate`,
        params,
        {
          headers: {
            Authorization: this.client_access_token,
          },
        },
      );
      this.delegate_code = data.data.code;
      return data.data.code;
    } catch (error) {
      const err = error as AxiosError;
      if (err.response) {
        console.log(err.response.status);
      }
    }
  }

  async TinkLink(options?: Record<string, any>): Promise<string> {
    let aditionalOptions = '';
    for (const property in options) {
      aditionalOptions += `&${property}=${options[property]}`;
    }
    let link = '';
    try {
      link = `https://link.tink.com/1.0/transactions/connect-accounts?client_id=${
        this.CLIENT_ID
      }&authorization_code=${this.delegate_code}&market=FR${
        aditionalOptions != '' ? aditionalOptions : ''
      }`;
      this.tink_link = link;
      return link;
    } catch (error) {}
    return link;
  }

  async UpdateTinkLink(): Promise<string> {
    let link = '';
    try {
      link = `https://link.tink.com/1.0/transactions/update-consent?client_id=${this.CLIENT_ID}&redirect_uri=http://localhost:8080/callback&credentials_id=&authorization_code=${this.delegate_code}&market=FR`;
      this.tink_link = link;
      return link;
    } catch (error) {}
    return link;
  }

  async Webhook(): Promise<string | undefined> {
    try {
      const object = {
        description: 'tink-legacy-webhook',
        disabled: false,
        enabledEvents: [
          'account:created',
          'account:updated',
          'account-booked-transactions:modified',
          'account-transactions:modified',
        ],
        url: '',
      };
      const params = JSON.stringify(object);
      const data = await axios.post(
        `${this.BASE_URL}/events/v2/webhook-endpoints`,
        params,
        {
          headers: {
            Authorization: this.client_access_token,
          },
        },
      );
      return data.data;
    } catch (error) {
      const err = error as AxiosError;

      if (err.code === 'ERR_HTTP_INVALID_HEADER_VALUE') {
        await this.ErrorHandler(401);
        return await this.Webhook();
      }
      if (err.response) {
        await this.ErrorHandler(err.response?.status);
        return await this.Webhook();
      }
    }
  }

  async ListWebhook(): Promise<string | undefined> {
    try {
      const data = await axios.get(
        `${this.BASE_URL}/events/v2/webhook-endpoints`,
        {
          headers: {
            Authorization: this.client_access_token,
          },
        },
      );
      return data.data;
    } catch (error) {
      const err = error as AxiosError;

      if (err.code === 'ERR_HTTP_INVALID_HEADER_VALUE') {
        await this.ErrorHandler(401);
        return await this.ListWebhook();
      }
      if (err.response) {
        await this.ErrorHandler(err.response?.status);
        return await this.ListWebhook();
      }
    }
  }

  async DeleteWebhook(id: string): Promise<Record<string, string> | undefined> {
    try {
      const data = await axios.delete(
        `${this.BASE_URL}/events/v2/webhook-endpoints/${id}`,
        {
          headers: {
            Authorization: this.client_access_token,
          },
        },
      );
      return data.data;
    } catch (error) {
      const err = error as AxiosError;
      if (err.code === 'ERR_HTTP_INVALID_HEADER_VALUE') {
        await this.ErrorHandler(401);
        return await this.DeleteWebhook(id);
      }
      if (err.response) {
        await this.ErrorHandler(err.response?.status);
        return await this.DeleteWebhook(id);
      }
    }
  }


  async UpdateWebhook(id: string): Promise<Record<string, string> | undefined> {
    try {
      const object = {
        description: 'tink-test',
        disabled: false,
        enabledEvents: [
          'account:created',
          'account:updated',
          'account-booked-transactions:modified',
          'account-transactions:modified',
        ],
        url: '',
      };
      const params = JSON.stringify(object);
      const data = await axios.patch(
        `${this.BASE_URL}/events/v2/webhook-endpoints/${id}`,
        params,
        {
          headers: {
            Authorization: this.client_access_token,
          },
        },
      );
      return data.data;
    } catch (error) {
      const err = error as AxiosError;
      console.log(error);

      if (err.code === 'ERR_HTTP_INVALID_HEADER_VALUE') {
        await this.ErrorHandler(401);
        return await this.UpdateWebhook(id);
      }
      if (err.response) {
        await this.ErrorHandler(err.response?.status);
        return await this.DeleteWebhook(id);
      }
    }
  }

  updateScopeAndRetrievetoken(scope: JSON): Promise<string> {
    scope;
    throw new Error('Method not implemented.');
  }
}

export class User {
  BASE_URL!: string;
  user_code?: string;
  CLIENT_ID!: string;
  USERS_SCOPES!: string;
  CLIENT_SCOPE!: string;
  CLIENT_SECRET!: string;
  ACTOR_CLIENT_ID!: string;
  user_access_token!: string;
  credential_Id!: string;

  constructor() {
    this.BASE_URL = process.env.BASE_URL as string;
    this.CLIENT_ID = process.env.CLIENT_ID as string;
    this.CLIENT_SCOPE = process.env.CLIENT_SCOPES as string;
    this.USERS_SCOPES = process.env.USERS_SCOPES as string;
    this.CLIENT_SECRET = process.env.CLIENT_SECRET as string;
    this.ACTOR_CLIENT_ID = process.env.ACTOR_CLIENT_ID as string;
  }

  async UserAccessToken(user_code: string): Promise<string> {
    this.user_code = user_code;
    const userParams = `client_id=${this.CLIENT_ID}&client_secret=${this.CLIENT_SECRET}&code=${this.user_code}&grant_type=authorization_code`;
    const userData = await axios.post(
      `${this.BASE_URL}/api/v1/oauth/token`,
      userParams,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        httpAgent: new http.Agent({ keepAlive: true }),
        httpsAgent: new https.Agent({ keepAlive: true }),
      },
    );
    const userToken = `${userData.data.token_type} ${userData.data.access_token}`;
    this.user_access_token = userToken;
    return userToken;
  }

  async getUser(): Promise<string | any> {
    let user;
    try {
      const data = await axios.get(`${this.BASE_URL}/api/v1/user`, {
        headers: {
          Authorization: this.user_access_token,
        },
      });
      user = data.data;
      return user;
    } catch (error) {
      const err = error as AxiosError;
      if (err.response) {
        console.log(err.response.status);
        console.log(err.response.data);
      }
    }
    return user;
  }

  async deleteUser(): Promise<any> {
    // the extra scope shoold be added right here it does not work if you put it from the beginning
    const params = {
      scope: 'user:delete',
    };
    const body = JSON.stringify(params);
    try {
      const data = await axios.post(
        `${this.BASE_URL}/api/v1/user/delete`,
        body,
        {
          headers: {
            Authorization: this.user_access_token,
            'Content-Type': 'application/json',
          },
        },
      );
      return data;
    } catch (error) {}
  }

  async Accounts(): Promise<Record<string, any>[]> {
    let Accounts;
    try {
      const data = await axios.get(`${this.BASE_URL}/data/v2/accounts`, {
        headers: {
          Authorization: this.user_access_token,
        },
      });
      Accounts = data.data.accounts;
      return Accounts;
    } catch (error) {
      console.log(error);

      const err = error as AxiosError;
      console.log(err.code);
    }
    return Accounts;
  }

  async AccountsById(id: string): Promise<Record<string, any>[] | any> {
    let Accounts;
    try {
      const data = await axios.get(`${this.BASE_URL}/data/v2/accounts/${id}`, {
        headers: {
          Authorization: this.user_access_token,
        },
      });
      Accounts = data.data;
      return Accounts;
    } catch (error) {
      console.log(error);
    }
    return Accounts;
  }

  async AccountBalance(id: string): Promise<Record<string, any>[] | any> {
    let Accounts;
    try {
      const data = await axios.get(
        `${this.BASE_URL}/data/v2/accounts/${id}/balances`,
        {
          headers: {
            Authorization: this.user_access_token,
          },
        },
      );
      Accounts = data.data;
      return Accounts;
    } catch (error) {
      console.log(error);
    }
    return Accounts;
  }

  async Transactions(
    arg?: TinkTransctionsParams,
  ): Promise<Record<string, any>[]> {
    const Transactions = [];
    let keepGoing = true;
    let data;
    let pageToken = '';
    try {
      while (keepGoing) {
        data = await axios.get(
          `${this.BASE_URL}/data/v2/transactions${
            arg?.accountId ? `?accountIdIn=${arg.accountId}` : ''
          }${
            arg?.isBooked == true && arg.accountId
              ? '&statusIn=BOOKED'
              : arg?.isBooked == true && !arg.accountId
              ? '?statusIn=BOOKED'
              : ''
          }${
            arg?.beginnigDate && (arg.accountId || arg.isBooked)
              ? `&bookedDateGte=${arg.beginnigDate}`
              : arg?.beginnigDate && !arg.accountId && !arg.isBooked
              ? `?bookedDateGte=${arg.beginnigDate}`
              : ''
          }${
            arg?.endDate && (arg.accountId || arg.isBooked)
              ? `&bookedDateLte=${arg.endDate}`
              : arg?.endDate && !arg.accountId && !arg.isBooked
              ? `?bookedDateLte=${arg.endDate}`
              : ''
          }
          `,
          {
            headers: {
              Authorization: arg?.userToken ?? this.user_access_token,
            },
            params: { pageToken },
          },
        );

        pageToken = data.data.nextPageToken;
        const transaction = data.data.transactions;
        Transactions.push(...transaction);
        if (pageToken == '') {
          keepGoing = false;
          return Transactions;
        }
      }
    } catch (error) {
      console.log(error);
    }
    return Transactions;
  }

  async ListCredentials() {
    try {
      const result = await axios.get(
        `${this.BASE_URL}/api/v1/credentials/list`,
        {
          headers: {
            Authorization: this.user_access_token,
            'Content-Type': 'application/json',
          },
        },
      );
      return result.data;
    } catch (error) {
      console.log(error);
    }
  }

  async ListProviderConsents() {
    try {
      const result = await axios.get(
        `${this.BASE_URL}/api/v1/provider-consents`,
        {
          headers: {
            Authorization: this.user_access_token,
            'Content-Type': 'application/json',
          },
        },
      );
      return result.data;
    } catch (error) {
      console.log(error);
    }
  }

  async ProviderConsentsByCredentialId(id: string) {
    try {
      const result = await axios.get(
        `${this.BASE_URL}/api/v1/provider-consents?credentialsId=${id}`,
        {
          headers: {
            Authorization: this.user_access_token,
            'Content-Type': 'application/json',
          },
        },
      );
      return result.data;
    } catch (error) {
      console.log(error);
    }
  }

  async Refresh(): Promise<void> {
    const params = {
      scope: 'credentials:refresh',
    };
    const data = await axios.post(
      `${this.BASE_URL}/api/v1/credentials/${this.credential_Id}/refresh`,
      params,
      {
        headers: {
          Authorization: this.user_access_token,
        },
      },
    );
    console.log(data.data);
    return;
  }
}
