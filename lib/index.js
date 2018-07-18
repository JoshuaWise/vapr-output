'use strict';
const negotiate = require('./negotiate');
const output = require('./output');

module.exports = ({ fallback, encodeNull, default: defaultType, ...serializers } = {}) => {
	encodeNull = !!encodeNull;
	const typesVary = Object.keys(serializers).length > 1;
	
	// Create a map from media types to serializer definitions.
	const definitions = new Map;
	for (let [mediaType, serializer] of Object.entries(serializers)) {
		const definition = { params: anyParams, handler: undefined };
		if (!mediaRange.test(mediaType)) throw new TypeError(`Invalid media type: ${mediaType}`);
		if (typeof serializer === 'object' && serializer !== null) {
			if (serializer.params != null) {
				if (typeof serializer.params !== 'function') throw new TypeError('Expected \'params\' option to be a function');
				definition.params = serializer.params;
			}
			serializer = serializer.serializer;
		}
		if (typeof serializer !== 'function') throw new TypeError('Expected each output serializer to be a function');
		mediaType = mediaType.toLowerCase();
		definition.handler = output(typesVary, encodeNull, mediaType, serializer);
		definitions.set(mediaType, definition);
	}
	
	// Identify the default response handler.
	let defaultHandler;
	if (defaultType == null) {
		if (definitions.size === 1) defaultHandler = Array.from(definitions.values())[0].handler;
		else if (definitions.size) throw new TypeError('The \'default\' option is required when multiple types are defined');
		else throw new TypeError('Expected at least one output serializer to be defined');
	} else if (typeof defaultType === 'string') {
		defaultType = defaultType.toLowerCase();
		if (definitions.has(defaultType)) defaultHandler = definitions.get(defaultType).handler;
		else throw new TypeError(`Default serializer "${defaultType}" is not defined`);
	} else {
		throw new TypeError('Expected \'default\' option to be a string');
	}
	
	// Return the parameterized plugin.
	return negotiate(definitions, defaultHandler, !!fallback);
};

const anyParams = () => true;
const mediaRange = /^(?!\*\/\*$)[-!#$%&'*+.^_`|~a-z\d]+\/(?!\*$)[-!#$%&'*+.^_`|~a-z\d]+$/i;
