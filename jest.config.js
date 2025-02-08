module.exports = {
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
        '^.+\\.(css|less)$': './__tests__/__transformers__/styleStub.js'
    },
    globals: {
        'ts-jest': {
            tsConfig: '<rootDir>/tsconfig.json'
        }
    },
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    // moduleDirectories: ['<rootDir>/local_modules', 'local_modules', '<rootDir>/node_modules', 'node_modules'],
    // modulePaths: ['<rootDir>', 'local_modules'],
    moduleNameMapper: {
        // '^local_modules/(.*)': '<rootDir>/local_modules/$1'
        recharts: '<rootDir>/local_modules/recharts'
    },
    setupFiles: ['<rootDir>/__tests__/__config__/test-shim.js', '<rootDir>/__tests__/__config__/test-setup.js']
};
