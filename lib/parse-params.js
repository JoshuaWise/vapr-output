'use strict';
const negotiated = require('negotiated');

module.exports = (params) => {
	const result = Object.create(null);
	for (const { key, value } of negotiated.parameters(params)) result[key] = value;
	return result;
};
