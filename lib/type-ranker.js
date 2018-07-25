'use strict';
const negotiated = require('negotiated');

module.exports = (acceptHeader) => {
	if (acceptHeader === undefined) return;
	const rules = [...negotiated.mediaTypes(acceptHeader)];
	let bias = 0;
	for (const x of rules) {
		x.params = x.params ? [...negotiated.parameters(x.params)] : undefined;
		x.weight += bias;
		bias += 1e-12; // Favor rules that are declared earlier in the header
	}
	return rankMediaType(rules);
};

const rankMediaType = (rules) => ({ type, params }) => {
	let best;
	for (const x of rules) {
		if (!typesMatch(x.type, type)) continue;
		if (!paramsMatch(x.params, params)) continue;
		best = moreSpecificRule(best, x);
	}
	return best ? best.weight : 0;
};

// TODO: handle charset parameter specially to be robust against non-conforming clients? (pretend as if all of our output definitions had charset={{supportedCharsets}})
const typesMatch = (pattern, type) => {
	if (pattern === type) return true;
	if (pattern === '*/*') return true;
	if (!pattern.endsWith('/*')) return false;
	return pattern.slice(0, -2) === type.slice(0, type.indexOf('/'));
};

// TODO: this always matches case-sensitively, which might not always be desired.
const paramsMatch = (required, actual) => {
	if (required === undefined) return true;
	for (const { key, value } of required) {
		if (actual.get(key) !== value) return false;
	}
	return true;
};

const moreSpecificRule = (a, b) => {
	if (a === undefined) return b;
	if (a.type === b.type) {
		const av = (a.params ? a.params.length : 0);
		const bv = (b.params ? b.params.length : 0);
		return av > bv ? a : b;
	} else {
		const av = a.type.endsWith('/*') ? a.type === '*/*' ? 0 : 1 : 2;
		const bv = b.type.endsWith('/*') ? b.type === '*/*' ? 0 : 1 : 2;
		return av > bv ? a : b;
	}
};
