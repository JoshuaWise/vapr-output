'use strict';
const createTypeRanker = require('./type-ranker');
const acceptsCharset = require('./accepts-charset');

/*
	This performs content negotiation to determine which output handler to use.
	It automatically rejects requests that either do not accept utf-8 charsets
	or do not accept any of the possible output types.
 */

module.exports = (definitions) => (req) => {
	let validCharset, typeRanker;
	try { validCharset = acceptsCharset(req.headers.get('accept-charset')); }
	catch (_) { return [400, 'Malformed Accept-Charset Header']; }
	if (!validCharset) return [406, 'No Acceptable Charset'];
	try { typeRanker = createTypeRanker(req.headers.get('accept')); }
	catch (_) { return [400, 'Malformed Accept Header']; }
	
	// TODO: in the case of equally ranked handlers, priority should go to the one that matches the earlier client rule
	let bestRank = 0, bestHandler;
	for (const x of definitions) {
		const rank = typeRanker(x) * charsetRanker(x);
		if (rank > bestRank) {
			bestRank = rank;
			bestHandler = x.handler;
		}
	}
	
	return bestHandler || [406, 'No Acceptable Content-Type'];
};
