const getProductById = require('./handler');

describe('sum module', () => {
    test('My first test', () => {
        expect(getProductById(13)).toBe(10);
    });
});

