# sugarcrm-sdk

An UNOFFICIAL module for integrating with SugarCRM. This SDK helps you initialize and communicate with SugarCRM through the Sugar REST API.

## Installation

```bash
npm install sugarcrm-sdk
```

## Features

- Seamless configuration setup using `.env` or direct configuration.
- Initialization and test pinging to ensure correct configurations.
- Authentication handling and setup.
- Provides interfaces for SugarAPI calls.
- Queue management for API requests with options for concurrency and size limitations.
- Supports GET, POST, PUT, and DELETE requests.
- Concurrent request handling.

## Quick Start

1. First, ensure your configurations are set up. Use `.env` or provide them directly.



2. Import the SDK and Execute:
##### Using CommonJS:

```javascript
const sugarSdk = require('sugarcrm-sdk');
```

##### Using ES6:

```javascript
import sugarSdk from 'sugarcrm-sdk';
```

## Configurations

The SDK expects the following configurations:

- `username`: SugarCRM username.
- `password`: SugarCRM password.
- `client_id`: [SugarCRM client ID](https://support.sugarcrm.com/Documentation/Sugar_Developer/Sugar_Developer_Guide_12.2/Integration/Web_Services/REST_API/Endpoints/oauth2token_POST/).
- `client_secret`: [SugarCRM client secret](https://support.sugarcrm.com/Documentation/Sugar_Developer/Sugar_Developer_Guide_12.2/Integration/Web_Services/REST_API/Endpoints/oauth2token_POST/).
- `platform`: [SugarCRM platform](https://support.sugarcrm.com/Documentation/Sugar_Versions/12.0/Ent/Administration_Guide/Developer_Tools/index.html#Configure_API_Platforms).
- `host`: SugarCRM host URL (ex `https://sugar.coolsite.com`).
- `version`: [SugarCRM API version](https://support.sugarcrm.com/Documentation/Sugar_Developer/Sugar_Developer_Guide_13.1/Integration/Web_Services/index.html) (ex `v11_21`) Do not add `/rest/`.

These configurations can be stored in a `.env` file or passed directly.

## Methods

### Sugar

The main class that initializes and manages the communication with SugarCRM.

**Methods**

- `initialize()`: Initializes the SDK, setting up the SugarAPI URL, authentication, and tests the connection.

- `testPing()`: Pings the SugarAPI to test the connection.

- `addToQueue(method, path, data?)`: Add an API request (GET, POST, PUT, DELETE) to a managed queue for processing.

- `processQueue()`: Process the queued API requests concurrently.

- `setMaxQueueSize(size)`: Set the maximum size of the API request queue.

- `setConcurrencyLevel(concurrency)`: Set the number of API requests to be processed concurrently.

- `getQueueSize()`: Returns the current number of items in the queue.

- `getQueue()`: Returns the entire array of queued requests.

- `toggleQueueProcessing()`: Pause or restart the processing of the queue.

- `clearQueue(n?)`: Delete all or n-amount of items from the queue.

- `get(path)`: Make a GET request to the specified path.

- `post(path, data)`: Make a POST request to the specified path.

- `put(path, data)`: Make a PUT request to the specified path.

- `delete(path)`: Make a DELETE request to the specified path.

## Usage

To start using the SDK:

1. Import and initialize:

```javascript
const sugarSdk = require('sugarcrm-sdk');
```

2. Create an instance of `Sugar`:

```javascript
const sugarConfigs = {
  username: 'USERNAME',
  password: 'PASSWORD',
  client_id: 'CLIENT_ID',
  client_secret: 'CLIENT_SECRET',
  platform: 'PLATFORM', 
  host: 'HOST_URL',
  version: 'VERSION', 
};
const sugar = new sugarSdk.Sugar(sugarConfigs);
```

3. Initialize and test:

```javascript
await sugar.initialize();
```

4. Making API Calls to Sugar:

```javascript
//  GET
const get_account = await sugar.get('/Accounts/aaaaaaaa-bbbb-cccc-dddddddddddd')

//  PUT
const put_account = await sugar.put('/Accounts/aaaaaaaa-bbbb-cccc-dddddddddddd',
{
  first_name:"hello", 
  last_name:"world"
})

//  POST
const put_account = await sugar.post('/Accounts',
{
  first_name:"hello", 
  last_name:"world",
})

//  DELETE
const put_account = await sugar.delete('/Accounts/aaaaaaaa-bbbb-cccc-dddddddddddd',
{
  first_name:"hello", 
  last_name:"world",
})
```

## Contributing

We welcome contributions! If you find a bug or have a feature request, please open an issue. If you'd like to contribute code, please fork the repository and submit a pull request.

## License

ISC License (ISC)

Copyright (c) 2023, J. Horst

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.