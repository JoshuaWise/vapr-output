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

> If a request is received without the Accept header, the first declared media type is used.

## Options

### options.encodeNull = *false*
### options.encodeUndefined = *false*

By default, response bodies of `null` or `undefined` will not be serialized and will not be assigned a Content-Type because they represent "no data". For example, `undefined` bodies are typically used for `204` or `400` responses. However, if `encodeNull` or `encodeUndefined` is `true`, response bodies of `null` or `undefined` will not be skipped (respectively).

```js
route.use(output({
  'encodeNull': true,
  'encodeUndefined': false,
  'application/json': JSON.stringify,
}));
```

### options.strictParameters = *false*

By default, media parameters are negotiated in a case-insensitive manner. This is usually desirable because the most common parameters—such as `charset`—are indeed case-insensitive. However, if you're using media parameters that are case-sensitive, you can accommodate them by setting `strictParameters` to `true`.

```js
route.use(output({
  'strictParameters': true,
  'application/foo; some-strange-parameter=hello': body => { ... },
}));
```

### options.forced = *false*

This option is used to bypass content negotiation. It cannot be used when multiple media types are declared.

```js
route.use(output({
  'forced': true,
  'text/plain; charset=utf-8': String,
}));
```
