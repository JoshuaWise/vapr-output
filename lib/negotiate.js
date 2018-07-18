'use strict';
const negotiated = require('negotiated');

module.exports = (definitions, defaultHandler, fallback) => (req) => {
	let handler;
	const accept = req.headers.get('accept');
	if (accept === undefined) return defaultHandler;
	try { handler = getTopHandler(negotiated.mediaTypes(accept), handlers); }
	catch (_) { return [400, 'Malformed Accept Header']; }
	if (handler) return handler;
	if (fallback) return defaultHandler;
	return [406, 'No Acceptable Content-Type'];
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

const highestWeight = (a, b) => a.weight >= b.weight ? a : b;
const supportedCharsets = ['utf-8', 'utf8', 'unicode-1-1-utf-8'];
