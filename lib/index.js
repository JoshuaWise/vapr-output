'use strict';
const negotiate = require('./negotiate');
const output = require('./output');

// TODO: add validation to prevent users from defining */*, */type, or media parameters

module.exports = ({ fallback, parseNull, default: defaultType, ...parsers } = {}) => {
	// Create a map from media types to response handlers.
	const definitions = Object.entries(parsers).map(([k, v]) => [k.toLowerCase(), v]);
	if (!definitions.every(([, v]) => typeof v === 'function')) throw new TypeError('Expected each output parser to be a function');
	const handlers = new Map(definitions.map(([k, v]) => [k, output(definitions.length > 1, !!parseNull, k, v)]));
	
	// Identify the default response handler.
	let defaultHandler;
	if (defaultType == null) {
		if (handlers.size === 1) defaultHandler = Array.from(handlers.values())[0];
		else if (handlers.size) throw new TypeError('The \'default\' option is required when multiple parsers are defined');
		else throw new TypeError('Expected at least one output parser to be defined');
	} else if (typeof defaultType === 'string') {
		defaultType = defaultType.toLowerCase();
		if (handlers.has(defaultType)) defaultHandler = handlers.get(defaultType);
		else throw new TypeError(`Default parser "${defaultType}" is not defined`);
	} else {
		throw new TypeError('Expected \'default\' option to be a string');
	}
	
	// Return the parameterized plugin.
	return negotiate(handlers, defaultHandler, !!fallback);
};
