import BaseToken from '../base-token';

export interface IfTokenOptions {
    position: number;
    condition: BaseToken;
    whenTrue: BaseToken;
    whenFalse?: BaseToken;
}

export default class IfToken extends BaseToken {
    condition: BaseToken;
    whenTrue: BaseToken;
    whenFalse?: BaseToken;

    constructor(options: IfTokenOptions) {
        super({
            position: options.position,
            type: 'IF'
        })
        this.condition = options.condition;
        this.whenTrue = options.whenTrue;
        this.whenFalse = options.whenFalse;
    }

    toJSON() {
        return {
            position: this.position,
            type: this.type,
            value: undefined,
            condition: this.condition.toJSON(),
            whenTrue: this.whenTrue.toJSON(),
            whenFalse: this.whenFalse ? this.whenFalse.toJSON() : undefined
        };
    }

    async evaluate(options: EvaluateOptions): Promise<unknown> {
        const result = await this.condition.evaluate(options);
        if (result) {
            return this.whenTrue.evaluate(options);
        }
        if (this.whenFalse) {
            return this.whenFalse.evaluate(options);
        }
    }
}