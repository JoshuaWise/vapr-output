'use strict';
const { Promise, River } = require('vapr');
const vary = require('./vary');

// TODO: have a way to vary on accept-charset
// TODO: have a way to forward media parameters to the content-type header (for the defaultHandler too)

module.exports = (shouldVary, encodeNull, mediaType, serialize) => (res) => {
	if (shouldVary) vary(res);
	if (!encodeNull && res.body == null) return;
	
	res.headers.set('content-type', mediaType);
	const result = serialize(res.body);
	
	if (!Promise.isPromise(result) || River.isRiver(result)) res.body = result;
	else return Promise.resolve(result).then(assignBody(res));
};

const assignBody = (res) => (value) => { res.body = value; };
