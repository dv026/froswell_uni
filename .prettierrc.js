/**
 * При использовании с VS Code необходимо добавить в settings.json следующие настройки:
    "[less]": {
        "editor.formatOnSave": true,
        "editor.defaultFormatter": "esbenp.prettier-vscode"
    },
    "[typescriptreact]": {
        "editor.formatOnSave": true,
        "editor.defaultFormatter": "esbenp.prettier-vscode"
    },
    "[typescript]": {
        "editor.formatOnSave": true,
        "editor.defaultFormatter": "esbenp.prettier-vscode"
    },
 */
module.exports = {
    arrowParens: 'avoid',
    bracketSpacing: true,
    endOfLine: 'auto',
    importOrder: [
        '^react$',
        '^(?![./])(?!.*([.]json)|.*([.]less)$).+$',
        '^[./](?!.*([.]json)|.*([.]less)$).+$',
        '^.+([.]less)$',
        '^.+([.]json)$'
    ],
    importOrderSeparation: true,
    insertPragma: false,
    jsxBracketSameLine: false,
    jsxSingleQuote: true,
    printWidth: 120,
    quoteProps: 'as-needed',
    requirePragma: false,
    semi: true,
    singleQuote: true,
    tabWidth: 4,
    trailingComma: 'none',
    useTabs: false,
    overrides: [
        {
            files: '*.less',
            options: {
                parser: 'less',
                tabWidth: 2
            }
        }
    ]
};
