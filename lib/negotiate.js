'use strict';
const createTypeRanker = require('./type-ranker');
const createCharsetRanker = require('./charset-ranker'); // TODO

// TODO: have some kind of default handling of non-utf8 charsets

module.exports = (definitions, fallback) => (req) => {
	let typeRanker, charsetRanker;
	try { typeRanker = createTypeRanker(req.headers.get('accept')); }
	catch (_) { return [400, 'Malformed Accept Header']; }
	try { charsetRanker = createCharsetRanker(req.headers.get('accept-charset')); }
	catch (_) { return [400, 'Malformed Accept-Charset Header']; }
	
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

// TODO: move this to charset-ranker.js
const getTopCharset = (charsets) => {
	const present = new Map;
	for (const x of charsets) if (supportedCharsets.includes(x.charset)) present.set(x.charset, x);
	if (!present.size) return '';
	const [best, second] = [...present.values()].sort(sortByWeight);
	if (!best.weight) return '';
	if (best.charset !== '*') return best.charset;
	const missing = supportedCharsets.find(findMissing, present);
	return missing || (second.weight ? second.charset : '');
};

const supportedCharsets = ['utf-8', 'utf8', 'unicode-1-1-utf-8']; // TODO
