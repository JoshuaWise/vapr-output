'use strict';
const negotiated = require('negotiated');
const negotiate = require('./negotiate');
const output = require('./output');

module.exports = ({ encodeNull = false, ...serializers } = {}) => {
	if (!Object.values(serializers).length) throw new TypeError('Expected at least one output serializer to be defined');
	if (!Object.values(serializers).every(x => typeof x === 'function')) throw new TypeError('Expected each output serializer to be a function');
	encodeNull = !!encodeNull;
	
	// Create an array of media type definitions.
	const definitions = [];
	const existing = new Set;
	const typesVary = Object.values(serializers).length > 1;
	for (const [string, serializer] of Object.entries(serializers)) {
		const match = string.match(mediaRange);
		if (!match) throw new TypeError(`Invalid media type: ${string}`);
		const type = match[1].toLowerCase();
		const params = new Map;
		for (const { key, value } of negotiated.parameters(match[2])) {
			if (params.has(key)) throw new TypeError(`Duplicate media parameter: ${key}`);
			params.set(key, value);
		}
		const hash = getHash(type, params);
		if (existing.has(hash)) throw new TypeError(`Duplicate media type: ${string}`);
		existing.add(hash);
		const handler = output(typesVary, encodeNull, string, serializer);
		definitions.push({ type, params, handler });
	}
	
	// Return the parameterized plugin.
	return negotiate(definitions);
};

const getHash = (type, params) => {
	const params = [...params.entries()].map(([k, v]) => `${k}\r${v}`);
	return `${type}\n${params.sort().join('\n')}`;
};

const mediaRange = /^(?!\*\/\*(?:$|[; \t]))([-!#$%&'*+.^_`|~a-z\d]+\/(?!\*(?:$|[; \t]))[-!#$%&'*+.^_`|~a-z\d]+)((?:[ \t]*;[ \t]*(?!q=)[-!#$%&'*+.^_`|~a-z\d]+=(?:[-!#$%&'*+.^_`|~a-z\d]+|"(?:[ \t\x21\x23-\x5b\x5d-\x7e\x80-\xff]|\\[ \t\x21-\x7e\x80-\xff])*"))*)$/i;
