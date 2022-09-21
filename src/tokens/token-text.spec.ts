import '../../jest/helpers';

import TokenType from '../types/token-types';

import Token from './token';
import TextToken from './token-text';

describe('TextToken class', function () {
    it('Exports a class as default', function () {
        expect(typeof Token).toBe('function');
    });
});

describe('new TextToken()', function () {
    it('Doesn\'t error when constructing', function () {
        new TextToken();
    });
    it('Is an instance of TextToken', function () {
        const token = new TextToken();
        expect(token instanceof TextToken).toBe(true);
    });
    it('Is an instance of Token', function () {
        const token = new TextToken();
        expect(token instanceof Token).toBe(true);
    });
    it('Stores type correctly', function () {
        const token = new TextToken();
        expect(token.type).toBe(TokenType.TEXT);
    });
    it('Stores value correctly', function () {
        const token = new TextToken({value: 'value'});
        expect(token.value).toBe('value');
    });
});

describe('Token#type', function () {
    it('Stores type correctly', function () {
        const token = new TextToken();
        expect(token.type).toBe(TokenType.TEXT);
    });
});

describe('Token#value', function () {
    it('Stores type correctly', function () {
        const token = new TextToken({value: 'value'});
        expect(token.value).toBe('value');
    });
});

describe('Token#evaluate()', function () {
    it('resolves to no value an empty string', async function () {
        expect.assertions(1);
        const token = new TextToken();
        const result = await token.evaluate({}, {});
        expect(result).toBe('');
    });

    it('resolves to a string', async function () {
        expect.assertions(1);
        const token = new TextToken({value: "text"});
        const result = await token.evaluate({}, {});
        expect(result).toBe('text');
    });
});