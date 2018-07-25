'use strict';
const { Promise, River } = require('vapr');
const vary = require('./vary');

module.exports = (shouldVary, encodeUndefined, encodeNull, mediaType, serialize) => (res) => {
	if (shouldVary) vary(res);
	if (!encodeUndefined && res.body === undefined) return;
	if (!encodeNull && res.body === null) return;
	
	res.headers.set('content-type', mediaType);
	const result = serialize(res.body);
	
	if (!Promise.isPromise(result) || River.isRiver(result)) res.body = result;
	else return Promise.resolve(result).then(assignBody(res));
};

const assignBody = (res) => (value) => { res.body = value; };
