'use strict';
const negotiated = require('negotiated');

/*
	Given an Accept-Charset header, this will return true only if the header
	indicates that the client accepts the utf-8 charset. If the header is not
	present in the request, the client implies that any charset is acceptable.
 */

module.exports = (acceptCharsetHeader) => {
	if (acceptCharsetHeader === undefined) return true;
	let utf8 = -1, other = -1;
	for (const { charset, weight } of negotiated.charsets(acceptCharsetHeader)) {
		if (charset === 'utf-8') utf8 = weight;
		else if (charset === '*') other = weight;
	}
	return utf8 > 0 || other > 0 && utf8 === -1;
};
