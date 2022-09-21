import '../../jest/helpers';

import TokenType from '../types/token-types';

import Token from './token';
import OperatorToken from './token-operator';

const stub = {
    value: 'text',
    toJSON() { return this.value }
};

describe('OperatorToken class', function () {
    it('Exports a class as default', function () {
        expect(typeof OperatorToken).toBe('function');
    });
});

describe('new OperatorToken()', function () {
    it('Doesn\'t error when construdting', function () {
        new OperatorToken();
    });
    it('Is an instance of OperatorToken', function () {
        const token = new OperatorToken();
        expect(token instanceof OperatorToken).toBe(true);
    });
    it('Is an instance of Token', function () {
        const token = new OperatorToken();
        expect(token instanceof Token).toBe(true);
    });
});

describe('Token#type', function () {
    it('Stores type correctly', function () {
        const token = new OperatorToken();
        expect(token.type).toBe(TokenType.OPERATOR);
    });
});

describe('OperatorToken#left', function () {
    it('Stores type correctly', function () {
        const token = new OperatorToken({
            left: stub
        });
        expect(token.left).toBe(stub);
    });
});

describe('OperatorToken#right', function () {
    it('Stores type correctly', function () {
        const token = new OperatorToken({
            right: stub
        });
        expect(token.right).toBe(stub);
    });
});

describe('OperatorToken#toJSON', function () {
    it('Does not throw', function () {
        const token = new OperatorToken();
        expect(() => token.toJSON()).not.toThrow();
    });

    it('Does not store a value when left is not specified', function () {
        const token = new OperatorToken();
        const result = token.toJSON();
        expect(result.left).toBeUndefined();
    });

    it('Stores left when specified', function () {
        const token = new OperatorToken({ left: stub });
        const result = token.toJSON();
        expect(result).hasProperty('left');
        expect(result.left).toBe('text');
    });

    it('Does not store a value when right is not specified', function () {
        const token = new OperatorToken();
        const result = token.toJSON();
        expect(result.left).toBeUndefined();
    });

    it('Stores right when specified', function () {
        const token = new OperatorToken({ right: stub });
        const result = token.toJSON();
        expect(result).hasProperty('right');
        expect(result.right).toBe('text');
    });
});

describe('Operator#evaluate()', function () {
    it('Throws an error', async function () {
        const token = new OperatorToken();
        expect(() => token.evaluate({}, {})).toAsyncThrow();
    });
})