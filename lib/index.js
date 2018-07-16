'use strict';
const negotiated = require('negotiated');
const output = require('./output');

module.exports = ({ fallback, default: defaultParser, ...parsers } = {}) => {
	if (!Object.values(parsers).every(x => typeof x === 'function')) throw new TypeError('Expected each output parser to be a function');
	parsers = new Map(Object.entries(parsers).map(([k, v]) => [k.toLowerCase(), output(v)]));
	fallback = !!fallback;
	
	// Identify the default parser.
	if (defaultParser == null) {
		if (parsers.size === 1) defaultParser = Array.from(parsers.values())[0];
		else if (parsers.size) throw new TypeError('The \'default\' option is required when multiple parsers are defined');
		else throw new TypeError('Expected at least one output parser to be defined');
	} else if (typeof defaultParser === 'string') {
		defaultParser = defaultParser.toLowerCase();
		if (parsers.has(defaultParser)) defaultParser = parsers.get(defaultParser);
		else throw new TypeError(`Default parser "${defaultParser}" is not defined`);
	} else {
		if (typeof defaultParser === 'function') defaultParser = output(defaultParser);
		else throw new TypeError('Expected \'default\' option to be a string or function');
	}
	
	// Return the parameterized plugin.
	return (req) => {
		let parser;
		const accept = req.headers.get('accept');
		if (accept === undefined) return defaultParser;
		try { parser = getTopParser(negotiated.mediaTypes(accept), parsers); }
		catch (_) { return [400, 'Malformed Accept Header']; }
		if (parser) return parser;
		if (fallback) return defaultParser;
		return [406, 'No Acceptable Content-Type'];
	};
};

const getTopParser = (mediaTypes, understood) => {
	// const present = new Map;
	// for (const x of mediaTypes) if (understood.has(x.encoding)) present.set(x.encoding, x);
	// if (!present.size) return 'identity';
	// const [best, second] = [...present.values()].sort(sortByWeight);
	// if (!best.weight) return present.has('identity') || present.has('*') ? '' : 'identity';
	// if (best.encoding !== '*') return best.encoding;
	// const missing = understood.find(findMissing, present);
	// return missing || (second.weight ? second.encoding : '');
};

const sortByWeight = (a, b) => b.weight - a.weight;
