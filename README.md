<div id="top"></div>

# Tink integration for Moneybounce

## Description

The integration was implemented using OOP (Factory Method).<br> The class handles the creation of users, connection of bank accounts, retrieval of transactions, accounts, and credentials, among other functionalities.

For more information please check Tink documentation (<a href="https://docs.tink.com/resources/transactions">Transactions<a/>).

## Instalation

To use our Class you will need to copy the ```tink.ts``` file or clonning this repository,

Before you begin make sure you have a ```.env``` file and you have these properties filled in it: 

```javascript
CLIENT_ID = ''
CLIENT_SECRET = ''
BASE_URL = 'https://api.tink.com'
CLIENT_SCOPES = 'scope1:read, scope2:delete,...'
USERS_SCOPES = 'scope1:read, scope2:delete,...'
ACTOR_CLIENT_ID = ''
```


## Usage

Import the Class and create instances:

```javascript
import { TinkConnector, User } from "./tink";

//tink
const TinkObject = new TinkConnector();
const TinkUserObject = new User();
```

### Before Tink-link

Generating a Client Access Token:

```javascript
const clientToken = await TinkObject.ClientAccessToken();
```


Creating a user:

```javascript
const user = await TinkObject.createUser(id)
```

Creating a delegate code:

```javascript
const code = await TinkObject.DelegateCode(id, fullname)
```

Creating a Tink Link:

```javascript
const options =  {
        "redirect_uri": "https://example.com/callback"
        // You could add more if you want (Check Tink Link Documentation)
    }

const options = await TinkObject.TinkObject.TinkLink(options)
```

All together :

```javascript
 const link =  TinkObject.ClientAccessToken().then(() =>
 TinkObject.createUser(id).then(() =>
   TinkObject.DelegateCode(id, fullname).then(() =>
     TinkObject.TinkLink(options),
   ),
 ),
 );
```
### After Tink-link
This part can be execute a part from the first part if you have an active userAccessToken you dont need to call  ```UserCode``` and ```UserAccessToken```

Retrieving Accounts :

```javascript
 const userCode = await TinkObject.UserCode(externalUserId);
      await TinkUserObject.UserAccessToken(userCode);
      const list_accounts = await TinkUserObject.Accounts()
```

Retrieving Transactions :

if you have an active userAccessToken you can pass the token in the ```userToken```Param

<a href="https://github.com/Moneybounce/tink/blob/master/src/Interfaces/ITransactions.ts">Here<a/> is the list of all the params you can use 


```javascript

// Without a userAccessToken
 const userCode = await TinkObject.UserCode(externalUserId);
      await TinkUserObject.UserAccessToken(userCode);
      const list_transactions = await TinkUserObject.Transactions({
          isBooked: true,
          userToken: req.body.userToken,
        });

// With a userAccessToken
const list_transactions = await TinkUserObject.Transactions({
          isBooked: true,
          userToken: userToken,
        });
```

## API Description

This is a schema outlining how the flow will work, and these are the steps to follow.<br>

![Capture d’écran 2022-04-27 à 17 03 19](https://user-images.githubusercontent.com/67472505/165549520-c43667ca-c6fe-41f1-8aba-4877c077ac00.png)


## TODO
- [ ] Implements typing for accounts and transactions
- [ ] Implements all the params for Transactions for the moment i implemented 5



Peace 🤘
