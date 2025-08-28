module.exports = {
	root: true,
	env: {
		es6: true,
		node: true,
	},
	parser: '@typescript-eslint/parser',
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2019,
	},
	plugins: [
		'n8n-nodes-base',
	],
	extends: [
		'plugin:n8n-nodes-base/community',
	],
	rules: {
		'n8n-nodes-base/community-package-json-author-email-still-default': 'error',
		'n8n-nodes-base/community-package-json-author-name-still-default': 'error',
	},
	ignorePatterns: [
		'dist/**',
		'node_modules/**',
		'*.js',
	],
};