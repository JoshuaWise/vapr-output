# vapr-output [![Build Status](https://travis-ci.org/JoshuaWise/vapr-output.svg?branch=master)](https://travis-ci.org/JoshuaWise/vapr-output)

## Installation

```bash
npm install --save vapr
npm install --save vapr-output
```

## Usage

This plugin is used to define which *media types* can be sent in outgoing response bodies. It performs [content negotiation](https://tools.ietf.org/html/rfc7231#section-3.4), ensuring that each client receives the best available media type. It also handles serialization, enabling you to use any object as a response body instead of just strings or Buffers.

```js
const output = require('vapr-output');
const app = require('vapr')();
const route = app.get('/foo');

route.use(output({
  'application/json': body => JSON.stringify(body),
  'application/xml': body => encodeAsXML(body),
}));

route.use((req) => {
  return [[{ foo: 'bar' }]]; // Some serializable data
});
```

The order in which you declare each media type indicates their precedence, should the client have no preference. When a request is received without an Accept header, the first declared media type will be used.

## Options

Response bodies of `null` or `undefined` will not be serialized and will not be assigned a Content-Type, because they represent "no data". For example, `undefined` bodies are typically used for `204` or `400` responses. However, if you want to treat `null` or `undefined` the same as any other value, you can use the `encodeUndefined` and/or `encodeNull` options.

```js
route.use(output({
  'encodeNull': true,
  'encodeUndefined': false,
  'application/json': JSON.stringify,
}));
```

Media parameters are negotiated in a case-insensitive manner because many common parameters (e.g., `charset`) are case-insensitive. If you're using media parameters that are case-sensitive, you can reverse this behavior by setting the `strictParameters` option.

```js
route.use(output({
  'strictParameters': true,
  'application/foo; some-strange-parameter=hello': serializationFunction,
}));
```

Sometimes you may wish to bypass content negotiation altogether. You can do this by setting the `forced` option.

```js
route.use(output({
  'forced': true,
  'text/plain; charset=utf-8': String,
}));
```
