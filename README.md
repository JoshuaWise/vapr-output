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
  'application/xml': body => stringifyXML(body),
}));

route.use((req) => {
  return [[{ foo: 'bar' }]]; // Some serializable data
});
```

The order in which you declare each media type indicates their precedence, should the client have no preference. When a request is received without an Accept header, the first declared media type will be used. If someone sends an Accept header but there are no acceptable media types available, they'll receive a `406` response.

If more than one media type is declared, the Vary header is automatically updated to make caches aware of the content negotiation.

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

## Remarks

Although the [HTTP specification](https://tools.ietf.org/html/rfc7231#section-5.3.3) defines an Accept-Charset header for negotiating character sets of textual content, it has become obsolete in practice. It turns out that the Accept header (handled by this plugin) is fully capable of negotiating character sets. In fact, the Accept header is able to be more specific than the Accept-Charset header because it can specify different character sets for each acceptable media type. Furthermore, nearly all web technologies have converged on simply using the UTF-8 character set for all textual content.

For all of these reasons, all major browsers have stopped sending the Accept-Charset header, and it's *not recommended* for servers to respect it anymore. Clients and servers alike should soley rely on the Accept header for negotiating character sets, or simply assume that UTF-8 will be used. Without following these recommendations, situations can occur where the Accept and Accept-Charset headers disagree with each other or introduce ambiguity.

References:
 - https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Charset
 - https://hsivonen.fi/accept-charset/
