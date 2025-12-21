# Expressinish
An expression-parsing middle ground library between find-and-replace and full js access

### Installing
```
npm install --save expressionish
```

### API
You can find the full API documentation at \[TODO: add link\]

```js
import { evaluate } from 'expressionish';

const variables = new Map();
variables.set('sum', {
    evaluate: async (meta, ...args) => {
        return args.reduce((prev, curr) => prev + Number(curr), 0)
    }
});

await evaluate({
    variables,
    expression: '\$sum[1,2,3]: $sum[1,2,3]'
}) // "$sum[1,2,3]: 6'
```

### Syntax
You can find the full Syntax documentation at \[TODO: add link\]

#### Text
Any text that is not seen as having significance is treated as plain text.

Concatenation is done simply by mixing insignificant and significant sequences: `v$var` is evaluated to "v" followed by result of evaluating `$var`


#### Character escapes
Character escapes treat characters that may have potential significance as literl text instead.

- `\\` - backslash
- `\"` - quote
- `\$` - dollar sign
- `\[` - opening bracket
- `\,` - comma
- `\]` - closing brackets
- `\r` - carriage return
- `\n` - line feed
- `\t` - tab

#### Double-Quoted Text
Text contained with in double quotes is treated as plain-text with the exception of character-escapes(of which get evaluated)

#### Double Backtick Text
Text contained within double backtick's is treated as plain-text with the exception of Variables

### Variables & Lookups
Variables are the power behind expressions. They can take no arguments or a slew of them! An argument can even be an expression of itself, containing variables and the like!

Variables take the format of:
```
"$" + [<lookup_prefix>] + <name> + [ "[" + <arg> + ["," + <arg>]... + "]" ]
```

Examples:
```
$name - variable
$name[1] - variable with one argument
$name[1,2,3] - variable with multiple arguments

$&name - variable lookup
$&name[1] - variable lookup with one argument
$&name[1,2,3] - variable lookup with multiple arguments
```

When it comes to arguments, leading/trailing whitespace is insignificant
```
These are all the same
$name[1]
$name[ 1]
$name[ 1 ]
$name[
    1
]
```

