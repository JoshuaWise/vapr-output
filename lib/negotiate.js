'use strict';
const Acceptable = require('./acceptable');

// TODO: have some kind of default handling of non-utf8 charsets

module.exports = (definitions, fallback) => (req) => {
	const aHeader = req.headers.get('accept');
	const acHeader = req.headers.get('accept-charset');
	let handler;
	
	if (aHeader === undefined) {
		if (acHeader === undefined) {
			handler = someKindOfDefaultHandler;
		} else {
			// find a definition with an acceptable charset
		}
	} else {
		if (acHeader === undefined) {
			
		} else {
			
		}
	}
	
	let handler;
	const accept = req.headers.get('accept');
	if (accept === undefined) return defaultHandler;
	try { handler = getTopHandler(negotiated.mediaTypes(accept), handlers); }
	catch (_) { return [400, 'Malformed Accept Header']; }
	if (handler) return handler;
	if (fallback) return defaultHandler;
	return [406, 'No Acceptable Content-Type'];
};

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


// TODO: do something with accept-charset

// TODO: support */* and type/*
// TODO: take x.params into consideration
const getTopHandler = (mediaTypes, handlers) => {
	const present = new Map;
	for (const x of mediaTypes) if (handlers.has(x.type)) present.set(x.type, x);
	if (!present.size) return;
	const best = [...present.values()].reduce(highestWeight);
	if (best.weight) return handlers.get(best.type);
};

function findMissing(x) { return !this.has(x); }
const sortByWeight = (a, b) => b.weight - a.weight;
const highestWeight = (a, b) => a.weight >= b.weight ? a : b;
const supportedCharsets = ['utf-8', 'utf8', 'unicode-1-1-utf-8'];
