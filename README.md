<div id="top"></div>

# Tink-Manager-Legacy
The latest Tink integration
# API Description
In this API we will make the connection of our clients bank account,<br>
so what i will do is api calls and the routes for linking them with our mobile app

Technologies I used:<br>
  &nbsp; [Typescript](https://www.typescriptlang.org/) as the main language,<br>
  &nbsp; and some librairies,<br>
  &nbsp; hope it was a good choice 😁


This is a schema of how will the api be working and those are the steps to folow<br>

![Capture d’écran 2022-04-27 à 17 03 19](https://user-images.githubusercontent.com/67472505/165549520-c43667ca-c6fe-41f1-8aba-4877c077ac00.png)

<!-- GETTING STARTED -->
## Getting Started

### Prerequisites

You will need NPM(node package manager) to run this project
* npm
  ```sh
  npm install npm@latest -g
  ```
## Installation
Clone the repo
   ```sh
   git clone https://github.com/Moneybounce/Tink-Manager.git
   ```
Install NPM packages   
```bash
$ yarn install
```
## Running the app
```bash

# Prod
$ yarn start

# watch mode
$ yarn dev
```
<p align="right">(<a href="#top">back to top</a>)</p>

## Usage / Documentation 

## Get Tink code

### Request

`POST /code/`

`body: `
```javascript
{
id: "10"
}
```
    curl -i -H 'Accept: application/json' http://localhost:8080/code/
    
<p align="right">(<a href="#top">back to top</a>)</p>

    
### Response

    HTTP/1.1 200 OK
    Status: 200 OK
    Connection: close
    Content-Type: application/json
    Content-Length: 2

    { "delegate_code": "code" }
    
<p align="right">(<a href="#top">back to top</a>)</p>

# Private API
In here you can use the tink API to retrieve data we need with our own integration and our shortcuts

## Authentication

### Request

`POST /auth/login`

`body: `
```javascript
{
    "username": "ASK ME FOR IT",
    "password": "I WILL GIVE IT TO YOU"
}
```
    curl -i -H 'Accept: application/json' http://localhost:8080/auth/login
    
<p align="right">(<a href="#top">back to top</a>)</p>

    
### Response

    HTTP/1.1 200 OK
    Status: 200 OK
    Connection: close
    Content-Type: application/json
    Content-Length: 2

    {"accessToken": "with the token in here"}

## List transactions

### Request

`POST /transactions/list-transactions`

`body: `
```javascript
{
    "externalUserId": "999"
}
```
    curl -i -H 'Accept: application/json' http://localhost:8080/transactions/list-transactions
    
<p align="right">(<a href="#top">back to top</a>)</p>

    
### Response

    HTTP/1.1 200 OK
    Status: 200 OK
    Connection: close
    Content-Type: application/json
    Content-Length: 2

    {[]} // an array of transactions 


Peace 🤘

![image](https://user-images.githubusercontent.com/67472505/165550168-c0fc9ae0-7d5b-46ec-b651-d3a2fcbf4fed.png)


