const expresionish = import('./evaluate.mjs').then(expressionish => {
    module.exports.ExpressionError = expressionish.ExpressionError;
    module.exports.ExpressionSyntaxError = expressionish.ExpressionSyntaxError;
    module.exports.ExpressionVariableError = expressionish.ExpressionVariableError;
    module.exports.ExpressionArgumentsError = expressionish.ExpressionArgumentsError;
    return expressionish;
});

module.exports = async function evaluate(...args) {
    const evaluator = await expresionish;
    return evaluator['default'](...args);
};