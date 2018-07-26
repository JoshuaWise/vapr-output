'use strict';
const createTypeRanker = require('./type-ranker');

/*
	This performs content negotiation to determine which output handler to use.
	It rejects requests that do not accept any of the possible output types.
 */

module.exports = (definitions, defaultHandler) => (req) => {
	let typeRanker;
	try { typeRanker = createTypeRanker(req.headers.get('accept')); }
	catch (_) { return [400, 'Malformed Accept Header']; }
	if (!typeRanker) return defaultHandler;
	
	let bestRank = 0, bestHandler;
	for (const x of definitions) {
		const rank = typeRanker(x);
		if (rank > bestRank) {
			bestRank = rank;
			bestHandler = x.handler;
		}
	}
	
	return bestHandler || [406, 'No Acceptable Content-Type'];
};
