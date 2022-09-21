import '../../jest/helpers';

import Token from './token';

describe('Token class', function () {
    it('Exports a class as default', function () {
        expect(typeof Token).toBe('function');
    });
});

describe('Token#evaluate', function () {
    it('is a property', function () {
        expect(Token.prototype).hasProperty('evaluate');
    });
    it('is a function', function () {
        expect(typeof Token.prototype.evaluate).toBe('function')
    });
});

describe('Token#toJSON', function () {
    it('is a property', function () {
        expect(Token.prototype).hasProperty('toJSON');
    });
    it('is a function', function () {
        expect(typeof Token.prototype.toJSON).toBe('function');
    });
});

describe('Token#toString', function () {
    it('is a property', function () {
        expect(Token.prototype).hasProperty('toString');
    });
    it('is a function', function () {
        expect(typeof Token.prototype.toString).toBe('function');
    });
});

describe('new Token()', function () {
    it('doesn\'t error when constructing', function () {
        new Token();
    });
});

describe('Token.type', function () {
    const token = new Token();
    it('is a property', function () {
        expect(token).hasProperty('type');
    });
    it('is a number', function () {
        expect(typeof token.type).toBe('number');
    });
    it('is finite', function () {
        expect(Number.isFinite(token.type)).toBe(true);
    });
    it ('defaults to 0', function () {
        expect(token.type).toBe(0);
    });
    it('is stored properly when specified', function () {
        const token = new Token({ type: 99 });
        expect(token.type).toBe(99);
    });
});

describe('Token.position', function () {
    const token = new Token();
    it('is a property', function () {
        expect(token).hasProperty('position');
    });
    it('is a number', function () {
        expect(typeof token.position).toBe('number');
    });
    it('is finite', function () {
        expect(Number.isFinite(token.position)).toBe(true);
    });
    it ('defaults to 0', function () {
        expect(token.position).toBe(-1);
    });
    it('is stored properly when specified', function () {
        const token = new Token({ position: 99 });
        expect(token.position).toBe(99);
    });
});

describe('Token.value', function () {
    const token = new Token()
    it('is a property', function () {
        expect(token).hasProperty('value');
    });
    it('defaults to undefined', function () {
        expect(token.value).toBeUndefined();
    });
    it('is stored properly when specified', function () {
        const token = new Token({ value: 'value' });
        expect(token.value).toBe('value');
    });
});

describe('Token.evaluate()', function () {
    it('returns null when no value is given', async function () {
        const token = new Token();
        const result = await token.evaluate({}, {});
        expect(result).toBeNull();
    });
    it('returns the value when specified', async function () {
        const token = new Token({ value: 'value' });
        const result = await token.evaluate({}, {});
        expect(result).toBe('value');
    });
});

describe('Token.toJSON()', function () {
    const token = new Token({type: 1, position: 1, value: 'value'});
    const json = token.toJSON();

    it('returns an object', function () {
        expect(typeof json).toBe('object');
    });
    it('the result is an adequite depiction', function () {
        expect(json).hasProperty('type');
        expect(json.type).toBe(1);
        expect(json).hasProperty('position');
        expect(json.position).toBe(1);
        expect(json).hasProperty('value');
        expect(json.value).toBe('value');

        const extraKeys : boolean = Object.keys(json).some(key => (
            key !== 'type' &&
            key !== 'position' &&
            key !== 'value'
        ));

        if (extraKeys) {
            throw new Error('extra properties exist');
        }
    })
});

describe('Token.toString()', function () {
    const token = new Token({type: 1, position: 1, value: 'value'});
    it('returns a string', function () {
        expect(typeof token.toString()).toBe('string');
    });
    it('the result is valid json', function () {
        JSON.parse(token.toString());
    });
    it('the result is an adequit depiction of token', function () {
        const json = JSON.parse(token.toString());

        expect(json).hasProperty('type');
        expect(json.type).toBe(1);
        expect(json).hasProperty('position');
        expect(json.position).toBe(1);
        expect(json).hasProperty('value');
        expect(json.value).toBe('value');

        const extraKeys : boolean = Object.keys(json).some(key => (
            key !== 'type' &&
            key !== 'position' &&
            key !== 'value'
        ));

        if (extraKeys) {
            throw new Error('extra properties exist');
        }
    });
});