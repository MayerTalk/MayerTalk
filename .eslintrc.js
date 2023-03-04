module.exports = {
    root: true,
    env: {
        node: true
    },
    parserOptions: {
        ecmaVersion: 2020
    },
    extends: [
        'plugin:vue/vue3-essential',
        '@vue/standard'
    ],
    rules: {
        indent: ['error', 4, { SwitchCase: 1 }],
        'generator-star-spacing': 'off',
        'no-throw-literal': 'off',
        'no-return-assign': 'off',
        'no-return-await': 'off',
        'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
    }
}
