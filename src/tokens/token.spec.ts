import '../../jest/helpers';

import Token from './token';

describe('Token class', function () {
    it('Exports a class as default', function () {
        expect(typeof Token).toBe('function');
    });
});

describe('new Token()', function () {
    it('Doesn\'t error when constructing', function () {
        new Token();
    });
});

describe('Token#type', function () {
    const token = new Token();
    it('Is a property', function () {
        expect(token).hasProperty('type');
    });
    it('Is a number', function () {
        expect(typeof token.type).toBe('number');
    });
    it('Is finite', function () {
        expect(Number.isFinite(token.type)).toBe(true);
    });
    it('Defaults to 0', function () {
        expect(token.type).toBe(0);
    });
    it('Is stored properly when specified', function () {
        const token = new Token({ type: 99 });
        expect(token.type).toBe(99);
    });
});

describe('Token#position', function () {
    const token = new Token();
    it('Is a property', function () {
        expect(token).hasProperty('position');
    });
    it('Is a number', function () {
        expect(typeof token.position).toBe('number');
    });
    it('Is finite', function () {
        expect(Number.isFinite(token.position)).toBe(true);
    });
    it ('Defaults to 0', function () {
        expect(token.position).toBe(-1);
    });
    it('Is stored properly when specified', function () {
        const token = new Token({ position: 99 });
        expect(token.position).toBe(99);
    });
});

describe('Token#value', function () {
    const token = new Token()
    it('Is a property', function () {
        expect(token).hasProperty('value');
    });
    it('Defaults to undefined', function () {
        expect(token.value).toBeUndefined();
    });
    it('Is stored properly when specified', function () {
        const token = new Token({ value: 'value' });
        expect(token.value).toBe('value');
    });
});

describe('Token#toJSON()', function () {
    it('Is a property', function () {
        expect(Token.prototype).hasProperty('toJSON');
    });

    it('Is a function', function () {
        expect(typeof Token.prototype.toJSON).toBe('function');
    });

    it('Returns an object', function () {
        const token = new Token({type: 1, position: 1, value: 'value'});
        const json = token.toJSON();
        expect(typeof json).toBe('object');
    });

    it('The result is an adequite depiction', function () {
        const token = new Token({type: 1, position: 1, value: 'value'});
        const json = token.toJSON();
        expect(json).hasProperty('type');
        expect(json.type).toBe(1);
        expect(json).hasProperty('position');
        expect(json.position).toBe(1);
        expect(json).hasProperty('value');
        expect(json.value).toBe('value');

        expect(Object.keys(json).some(key => (
            key !== 'type' &&
            key !== 'position' &&
            key !== 'value'
        ))).toBe(false);
    })
});

describe('Token#toString()', function () {

    it('Is a property', function () {
        expect(Token.prototype).hasProperty('toString');
    });

    it('Is a function', function () {
        expect(typeof Token.prototype.toString).toBe('function');
    });

    it('Returns a string', function () {
        const token = new Token({type: 1, position: 1, value: 'value'});
        expect(typeof token.toString()).toBe('string');
    });

    it('The result is valid json', function () {
        const token = new Token({type: 1, position: 1, value: 'value'});
        JSON.parse(token.toString());
    });

    it('The result is an adequit depiction of token', function () {
        const token = new Token({type: 1, position: 1, value: 'value'});
        const json = JSON.parse(token.toString());

        expect(json).hasProperty('type');
        expect(json.type).toBe(1);
        expect(json).hasProperty('position');
        expect(json.position).toBe(1);
        expect(json).hasProperty('value');
        expect(json.value).toBe('value');

        expect(Object.keys(json).some(key => (
            key !== 'type' &&
            key !== 'position' &&
            key !== 'value'
        ))).toBe(false);
    });
});

describe('Token#evaluate()', function () {

    it('Is a property', function () {
        expect(Token.prototype).hasProperty('evaluate');
    });

    it('Is a function', function () {
        expect(typeof Token.prototype.evaluate).toBe('function')
    });

    it('to throw an error', function () {
        const token = new Token();
        expect(() => token.evaluate({}, {})).toAsyncThrow();
    });
});