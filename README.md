
# fastify-grant

> _Fastify plugin for **[Grant][grant]** OAuth Proxy_

```js
var fastify = require('fastify')
var cookie = require('fastify-cookie')
var session = require('fastify-session')
var grant = require('fastify-grant')

fastify()
  .register(cookie)
  .register(session, {secret: 'grant', cookie: {secure: false}})
  .register(grant({/*configuration - see below*/}))
  .listen(3000)
```

[Example](https://github.com/simov/grant/tree/master/examples/handler-fastify)

# Configuration


## Configuration: Basics

```json
{
  "defaults": {
    "origin": "http://localhost:3000",
    "transport": "session",
    "state": true
  },
  "google": {
    "key": "...",
    "secret": "...",
    "scope": ["openid"],
    "nonce": true,
    "custom_params": {"access_type": "offline"},
    "callback": "/hello"
  },
  "twitter": {
    "key": "...",
    "secret": "...",
    "callback": "/hi"
  }
}
```

- **defaults** - default configuration for all providers
  - **origin** - where your client server can be reached `http://localhost:3000` | `https://site.com` ...
  - **transport** - a [transport](#callback-transport) used to deliver the [response data](#callback-response) in your `callback` route
  - **state** - generate random state string
- **provider** - any [supported provider](#grant) `google` | `twitter` ...
  - **key** - `consumer_key` or `client_id` of your OAuth app
  - **secret** - `consumer_secret` or `client_secret` of your OAuth app
  - **scope** - array of OAuth scopes to request
  - **nonce** - generate random nonce string ([OpenID Connect](#connect-openid-connect) only)
  - **custom_params** - custom [authorization parameters](#connect-custom-parameters)
  - **callback** - relative route or absolute URL to receive the response data `/hello` | `https://site.com/hey` ...


## Configuration: Description

Key | Location | Description
:-| :-: | :-
***Authorization Server*** |
**`request_url`** | [oauth.json] | OAuth 1.0a only, first step
**`authorize_url`** | [oauth.json] | OAuth 2.0 first step, OAuth 1.0a second step
**`access_url`** | [oauth.json] | OAuth 2.0 second step, OAuth 1.0a third step
**`oauth`** | [oauth.json] | OAuth version number
**`scope_delimiter`** | [oauth.json] | String delimiter used for concatenating multiple scopes
**`token_endpoint_auth_method`** | `[provider]` | Authentication method for the token endpoint
**`token_endpoint_auth_signing_alg`** | `[provider]` | Signing algorithm for the token endpoint
***Client Server*** |
**`origin`** | `defaults` | Where your client server can be reached
**`prefix`** | `defaults` | Path prefix for the Grant internal routes
**`state`** | `defaults` | Random state string for OAuth 2.0
**`nonce`** | `defaults` | Random nonce string for OpenID Connect
**`pkce`** | `defaults` | Toggle PKCE support
**`response`** | `defaults` | Response data to receive
**`transport`** | `defaults` | A way to deliver the response data
**`callback`** | `[provider]` | Relative or absolute URL to receive the response data
**`overrides`** | `[provider]` | Static configuration overrides for a provider
**`dynamic`** | `[provider]` | Configuration keys that can be overridden dynamically over HTTP
***Client App*** |
**`key`** **`client_id`** **`consumer_key`** | `[provider]` | The `client_id` or `consumer_key` of your OAuth app
**`secret`** **`client_secret`**  **`consumer_secret`** | `[provider]` | The `client_secret` or `consumer_secret` of your OAuth app
**`scope`** | `[provider]` | List of scopes to request
**`custom_params`** | `[provider]` | Custom authorization parameters and their values
**`subdomain`** | `[provider]` | String to embed into the authorization server URLs
**`public_key`** | `[provider]` | Public PEM or JWK
**`private_key`** | `[provider]` | Private PEM or JWK
**`redirect_uri`** | `generated` | Absolute redirect URL of the OAuth app
***Grant*** |
**`name`** | `generated` | Provider's [name](#grant)
**`[provider]`** | `generated` | Provider's [name](#grant) as key
**`profile_url`** | [profile.json] | User profile URL


## Configuration: Values

Key | Location | Value
:- | :-: | :-:
***Authorization Server*** |
**`request_url`** | [oauth.json] | `'https://api.twitter.com/oauth/request_token'`
**`authorize_url`** | [oauth.json] | `'https://api.twitter.com/oauth/authenticate'`
**`access_url`** | [oauth.json] | `'https://api.twitter.com/oauth/access_token'`
**`oauth`** | [oauth.json] | `2` `1`
**`scope_delimiter`** | [oauth.json] | `','` `' '`
**`token_endpoint_auth_method`** | `[provider]` | `'client_secret_post'` `'client_secret_basic'` `'private_key_jwt'`
**`token_endpoint_auth_signing_alg`** | `[provider]` | `'RS256'` `'ES256'` `'PS256'`
***Client Server*** |
**`origin`** | `defaults` | `'http://localhost:3000'` `https://site.com`
**`prefix`** | `defaults` | `'/connect'` `/oauth` `''`
**`state`** | `defaults` | `true`
**`nonce`** | `defaults` | `true`
**`pkce`** | `defaults` | `true`
**`response`** | `defaults` | `['tokens', 'raw', 'jwt', 'profile']`
**`transport`** | `defaults` | `'querystring'` `'session'` `'state'`
**`callback`** | `[provider]` | `'/hello'` `'https://site.com/hi'`
**`overrides`** | `[provider]` | `{something: {scope: ['..']}}`
**`dynamic`** | `[provider]` | `['scope', 'subdomain']`
***Client App*** |
**`key`** **`client_id`** **`consumer_key`** | `[provider]` | `'123'`
**`secret`** **`client_secret`**  **`consumer_secret`** | `[provider]` | `'123'`
**`scope`** | `[provider]` | `['openid', '..']`
**`custom_params`** | `[provider]` | `{access_type: 'offline'}`
**`subdomain`** | `[provider]` | `'myorg'`
**`public_key`** | `[provider]` | `'..PEM..'` `'{..JWK..}'`
**`private_key`** | `[provider]` | `'..PEM..'` `'{..JWK..}'`
**`redirect_uri`** |`generated` | `'http://localhost:3000/connect/twitter/callback'`
***Grant*** |
**`name`** |`generated` | `name: 'twitter'`
**`[provider]`** |`generated` | `twitter: true`
**`profile_url`** | [profile.json] | `'https://api.twitter.com/1.1/users/show.json'`

---

# Connect


## Connect: Origin

```json
{
  "defaults": {
    "origin": "http://localhost:3000"
  }
}
```

The `origin` is where your client server can be reached.

You login by navigating to the `/connect/:provider` route where `:provider` is a key in your configuration, usually one of the [officially supported](#grant) ones, but you can define [your own](#misc-custom-providers) as well. Additionally you can login through a [static override](#connect-static-overrides) defined for that provider by navigating to the `/connect/:provider/:override?` route.

## Connect: Prefix

By default Grant operates on the following two routes:

```
/connect/:provider/:override?
/connect/:provider/callback
```

However, the default `/connect` prefix can be configured:

```json
{
  "defaults": {
    "origin": "http://localhost:3000",
    "prefix": "/oauth"
  }
}
```


## Connect: Redirect URI

The [`redirect_uri`](#misc-redirect-uri) of your OAuth app should follow this format:

```
[origin][prefix]/[provider]/callback
```

Where [`origin`](#connect-origin) and [`prefix`](#connect-prefix) have to match the ones set in your configuration, and [`provider`](#grant) is a provider key found in your configuration.

For example: `http://localhost:3000/connect/google/callback`

This redirect URI is used internally by Grant. Depending on the [`transport`](#callback-transport) being used you will receive the response data in the [`callback`](#callback-data) route or absolute URL configured for that provider.


## Connect: Custom Parameters

Some providers may employ custom authorization parameters that you can configure using the `custom_params` key:

```json
{
  "google": {
    "custom_params": {"access_type": "offline", "prompt": "consent"}
  },
  "reddit": {
    "custom_params": {"duration": "permanent"}
  },
  "trello": {
    "custom_params": {"name": "my app", "expiration": "never"}
  }
}
```


## Connect: OpenID Connect

The `openid` scope is required, and generating a random `nonce` string is optional but recommended:

```json
{
  "google": {
    "scope": ["openid"],
    "nonce": true
  }
}
```

Grant **does not** verify the signature of the returned `id_token` by default.

However, the following two claims of the `id_token` are being validated:

1. `aud` - is the token intended for my OAuth app?
2. `nonce` - does it tie to a request of my own?


## Connect: PKCE

PKCE can be enabled for all providers or for a specific provider only:

```json
{
  "google": {
    "pkce": true
  }
}
```

Providers that do not support PKCE will ignore the additional parameters being sent.


## Connect: Static Overrides

Provider sub configurations can be configured using the `overrides` key:

```json
{
  "github": {
    "key": "...", "secret": "...",
    "scope": ["public_repo"],
    "callback": "/hello",
    "overrides": {
      "notifications": {
        "key": "...", "secret": "...",
        "scope": ["notifications"]
      },
      "all": {
        "scope": ["repo", "gist", "user"],
        "callback": "/hey"
      }
    }
  }
}
```

Navigate to:

- `/connect/github` to request the public_repo `scope`
- `/connect/github/notifications` to request the notifications `scope` using another OAuth App (`key` and `secret`)
- `/connect/github/all` to request a bunch of `scope`s and also receive the response data in another `callback` route

---

# Callback


## Callback: Data

By default the response data will be returned in your `callback` route or absolute URL encoded as querystring.

Depending on the [`transport`](#callback-transport) being used the response data can be returned in the `session` or in the `state` object instead.

The amount of the returned data can be controlled through the [`response`](#callback-response) configuration.

### OAuth 2.0

```js
{
  id_token: '...',
  access_token: '...',
  refresh_token: '...',
  raw: {
    id_token: '...',
    access_token: '...',
    refresh_token: '...',
    some: 'other data'
  }
}
```

The `refresh_token` is optional. The `id_token` is returned only for [OpenID Connect](#connect-openid-connect) providers requesting the `openid` scope.


### OAuth 1.0a

```js
{
  access_token: '...',
  access_secret: '...',
  raw: {
    oauth_token: '...',
    oauth_token_secret: '...',
    some: 'other data'
  }
}
```


### Error

```js
{
  error: {
    some: 'error data'
  }
}
```


## Callback: Transport

### querystring

By default Grant will encode the OAuth [response data](#callback-data) as `querystring` in your `callback` route or absolute URL:

```json
{
  "github": {
    "callback": "https://site.com/hello"
  }
}
```

This is useful when using Grant as [OAuth Proxy](#dynamic-oauth-proxy). However this final `https://site.com/hello?access_token=...` redirect can potentially leak private data in your server logs, especially when sitting behind a reverse proxy.

### session

For local `callback` routes the session `transport` is recommended:

```json
{
  "defaults": {
    "transport": "session"
  },
  "github": {
    "callback": "/hello"
  }
}
```

This will make the OAuth [response data](#callback-data) available in the `session` object instead:

```js
req.session.grant.response // Fastify
```

### state

The request/response lifecycle `state` can be used as well:

```json
{
  "defaults": {
    "transport": "state"
  }
}
```

In this case a `callback` route is not needed, and it will be ignored if provided. The response data will be available in the request/response lifecycle state object instead:

```js
res.grant.response // Fastify
```

## Callback: Response

By default Grant returns all of the available tokens and the `raw` response data returned by the Authorization server:

```js
{
  id_token: '...',
  access_token: '...',
  refresh_token: '...',
  raw: {
    id_token: '...',
    access_token: '...',
    refresh_token: '...',
    some: 'other data'
  }
}
```

### querystring

When using the querystring [`transport`](#callback-transport) it might be a good idea to limit the response data:

```json
{
  "defaults": {
    "response": ["tokens"]
  }
}
```

This will return only the tokens available, without the `raw` response data.

This is useful when using Grant as [OAuth Proxy](#dynamic-oauth-proxy). Encoding potentially large amounts of data as querystring can lead to incompatibility issues with some servers and browsers, and generally is considered a bad practice.

### session

Using the session [`transport`](#callback-transport) is generally safer, but it also depends on the implementation of your session store.

In case your session store encodes the entire session in a cookie, not just the session ID, some servers may reject the HTTP request because of HTTP headers size being too big.

```json
{
  "google": {
    "response": ["tokens"]
  }
}
```

This will return only the tokens available, without the `raw` response data.

### jwt

Grant can also return even larger [response data](#callback-data) by including the decoded JWT for [OpenID Connect](#connect-openid-connect) providers that return `id_token`:

```json
{
  "google": {
    "response": ["tokens", "raw", "jwt"]
  }
}
```

This will make the decoded JWT available in the response data:

```js
{
  id_token: '...',
  access_token: '...',
  refresh_token: '...',
  raw: {
    id_token: '...',
    access_token: '...',
    refresh_token: '...',
    some: 'other data'
  },
  jwt: {id_token: {header: {}, payload: {}, signature: '...'}}
}
```

Make sure you include all of the response keys that you want to be returned when configuring the `response` data explicitly.


### profile

Outside of the regular OAuth flow, Grant can request the user profile as well:

```json
{
  "google": {
    "response": ["tokens", "profile"]
  }
}
```

Additionaly a `profile` key will be available in the response data:

```js
{
  access_token: '...',
  refresh_token: '...',
  profile: {some: 'user data'}
}
```

The `profile` key contains either the raw response data returned by the user profile endpoint or an error message.

Not all of the supported providers have their `profile_url` set, and some of them might require custom parameters. Usually the user profile endpoint is accessible only when certain `scope`s were requested.

---

# Dynamic Configuration


## Dynamic: Instance

Every Grant instance have a `config` property attached to it:

```js
var grant = Grant(require('./config'))
console.log(grant.config)
```

You can use the `config` property to alter the Grant's behavior during runtime without having to restart your server.

This property contains the **generated** configuration used internally by Grant, and changes made to that configuration affects the **entire** Grant instance!


## Dynamic: State

The request/response lifecycle state can be used to alter configuration on every request:

```js
req.grant = {dynamic: {subdomain: 'usershop'}} // Fastify
```

This is useful in cases when you want to configure Grant dynamically with potentially sensitive data that you don't want to send over HTTP.

The request/response lifecycle state is not controlled by the [`dynamic`](#dynamic-http) configuration, meaning that you can override any configuration key.

Any allowed [`dynamic`](#dynamic-http) configuration key sent through HTTP GET/POST request will override the identical one set using a state override.

## Dynamic: HTTP

The `dynamic` configuration allows certain configuration keys to be set dynamically over HTTP GET/POST request.

For example `shopify` requires your shop name to be embedded into the OAuth URLs, so it makes sense to allow the [`subdomain`](#subdomain-urls) configuration key to be set dynamically:

```json
{
  "shopify": {
    "dynamic": ["subdomain"]
  }
}
```

Then you can have a web form on your website allowing the user to specify the shop name:

```html
<form action="/connect/shopify" method="POST" accept-charset="utf-8">
  <input type="text" name="subdomain" value="" />
  <button>Login</button>
</form>
```

When making a `POST` request to the `/connect/:provider/:override?` route you have to mount a form body parser middleware before mounting Grant:

```js
// fastify
var parser = require('fastify-formbody')
.register(parser)
.register(grant(config))
```

Alternatively you can make a `GET` request to the `/connect/:provider/:override?` route:

```
https://awesome.com/connect/shopify?subdomain=usershop
```

Any `dynamic` configuration sent over HTTP GET/POST request overrides any other configuration.


  [grant]: https://github.com/simov/grant
  [grant-oauth]: https://grant.outofindex.com

  [oauth.json]: https://github.com/simov/grant/blob/master/config/oauth.json
  [profile.json]: https://github.com/simov/grant/blob/master/config/profile.json
  [reserved-keys]: https://github.com/simov/grant/blob/master/config/reserved.json
  [examples]: https://github.com/simov/grant/tree/master/examples
