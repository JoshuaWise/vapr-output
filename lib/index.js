'use strict';
const { parameters: allParams } = require('negotiated');
const parseParams = require('./parse-params');
const negotiate = require('./negotiate');
const output = require('./output');

module.exports = (types) => {
	let encodeNull = false;
	let fallback = false;
	
	// Handle the options object, if provided.
	if (!Array.isArray(types)) {
		if (types == null) throw new TypeError('Expected an array of output types');
		encodeNull = !!types.encodeNull;
		fallback = !!types.fallback;
		types = types.types;
		if (types == null) throw new TypeError('The \'types\' option is required');
		if (!Array.isArray(types)) throw new TypeError('Expected \'types\' option to be an array');
	}
	if (!types.length) throw new TypeError('Expected at least one output type to be defined');
	
	// Create a map from media types to output definitions.
	const definitions = new Map;
	const typesVary = types.length > 1;
	for (const obj of types) {
		if (typeof obj !== 'object' || obj === null) throw new TypeError('Expected each output type to be an object');
		const { mediaType, parameters, serializer } = obj;
		if (typeof serializer !== 'function') throw new TypeError('Expected each output type to have a \'serializer\' function');
		if (typeof mediaType !== 'string') throw new TypeError('Expected each output type to have a \'mediaType\' string');
		const match = mediaType.match(mediaRange);
		if (!match) throw new TypeError(`Invalid media type: ${mediaType}`);
		const type = match[1].toLowerCase();
		let params = match[2];
		if (definitions.has(type)) throw new TypeError(`Duplicate media type: ${type}`);
		if (parameters != null) {
			if (params) throw new TypeError('Cannot specify \'parameters\' when \'mediaType\' has embedded parameters');
			if (typeof parameters === 'string') {
				if (!mediaParameters.test(parameters)) throw new TypeError(`Invalid media parameters: ${parameters}`);
			} else if (typeof parameters !== 'function') {
				throw new TypeError('Expected \'parameters\' to be a string or function');
			}
			params = parameters;
		}
		const handler = output(typesVary || typeof params === 'function', encodeNull, type, serializer);
		if (typeof params === 'string') {
			if (params) params = parametersMatch([...allParams(params)], { ...parseParams(params) });
			else params = ignoreParameters;
		}
		definitions.set(type, { params, handler });
	}
	
	// Return the parameterized plugin.
	return negotiate(definitions, fallback);
};

const parametersMatch = (expected, result) => (actual) => {
	for (const { key, value } of expected) {
		if (actual[key] !== value) return;
	}
	return result;
};

const ignoreParameters = () => ({});
const mediaRange = /^(?!\*\/\*(?:$|[; \t]))([-!#$%&'*+.^_`|~a-z\d]+\/(?!\*(?:$|[; \t]))[-!#$%&'*+.^_`|~a-z\d]+)((?:[ \t]*;[ \t]*(?!q=)[-!#$%&'*+.^_`|~a-z\d]+=(?:[-!#$%&'*+.^_`|~a-z\d]+|"(?:[ \t\x21\x23-\x5b\x5d-\x7e\x80-\xff]|\\[ \t\x21-\x7e\x80-\xff])*"))*)$/i;
const mediaParameters = /^(?:[ \t]*;[ \t]*(?!q=)[-!#$%&'*+.^_`|~a-z\d]+=(?:[-!#$%&'*+.^_`|~a-z\d]+|"(?:[ \t\x21\x23-\x5b\x5d-\x7e\x80-\xff]|\\[ \t\x21-\x7e\x80-\xff])*"))*$/i;
