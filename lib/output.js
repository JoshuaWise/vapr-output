'use strict';
const { Promise, River } = require('vapr');
const vary = require('./vary');

// TODO: have a way to vary on accept-charset
// TODO: have a way to forward media parameters to the content-type header (for the defaultHandler too)

module.exports = (shouldVary, encodeNull, mediaType, serialize) => (params, paramString) => (res) => {
	if (shouldVary) vary(res);
	if (!encodeNull && res.body == null) return;
	
	res.headers.set('content-type', mediaType + paramString);
	const result = serialize(res.body, params);
	
	if (!Promise.isPromise(result) || River.isRiver(result)) res.body = result;
	else return Promise.resolve(result).then(assignBody(res));
};

const assignBody = (res) => (value) => { res.body = value; };
