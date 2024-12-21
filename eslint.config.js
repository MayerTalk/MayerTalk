import pluginVue from 'eslint-plugin-vue'
import vueTsEslintConfig from '@vue/eslint-config-typescript'

export default [
    {
        name: 'app/files-to-lint',
        files: ['**/*.{js,ts,mts,tsx,vue}'],
    },
    {
        name: 'app/files-to-ignore',
        ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
    },
    ...pluginVue.configs['flat/essential'],
    ...vueTsEslintConfig(),
    {
        name: 'app/all',
        languageOptions: {
            parserOptions: {
                ecmaVersion: 'esnext',
                sourceType: 'module',
            },
        },
        rules: {
            indent: ['error', 4, {SwitchCase: 1}],
            'generator-star-spacing': 'off',
            'no-throw-literal': 'off',
            'no-return-assign': 'off',
            'no-return-await': 'off',
        }
    }
]
