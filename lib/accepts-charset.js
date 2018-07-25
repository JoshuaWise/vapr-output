'use strict';
const negotiated = require('negotiated');

/*
	Given an Accept-Charset header, this will return true only if the header
	indicates that the client accepts the utf-8 charset. If the header is not
	present in the request, the client implies that any charset is acceptable.
 */

module.exports = (acceptCharsetHeader) => {
	if (acceptCharsetHeader === undefined) return true;
	const present = new Map;
	for (const { charset, weight } of negotiated.charsets(acceptCharsetHeader)) {
		if (matchingCharsets.includes(charset)) present.set(charset, weight);
	}
	if (present.size) {
		for (const [charset, weight] of present) {
			if (!weight) continue;
			if (charset.length > 1) return true;
			if (present.size < matchingCharsets.length) return true;
		}
	}
	return false;
};

const matchingCharsets = ['utf-8', 'utf8', 'unicode-1-1-utf-8', '*'];
