'use strict';
const { Promise, River } = require('vapr');
const vary = require('./vary');

module.exports = (shouldVary, parseNull, mediaType, parse) => (res) => {
	if (shouldVary) vary(res);
	if (!parseNull && res.body == null) return;
	
	res.headers.set('content-type', mediaType);
	const result = parse(res.body);
	
	if (!Promise.isPromise(result) || River.isRiver(result)) res.body = result;
	else return Promise.resolve(result).then(assignBody(res));
};

const assignBody = (res) => (value) => { res.body = value; };
