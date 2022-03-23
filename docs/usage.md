# Expressions
An expression is text consisting of literal text, quotes, escape sequences and variables.

# Format

## Special Characters
Certain character sequences hold special meaning

| Sequence | Evaluates to            |
|----------|-------------------------|
| `\t`     | tab                     |
| `\n`     | line feed               |
| `\r`     | carriage return         |
| `\\`     | literal backslash(\\)   |
| `\"`     | literal double quote(") |


## Variables
Variables come in two forms: those without arguments and those with.

Variables can occur anywhere within an expression and can even be used as arguments to another variable.

Variable names always start with `$` and are followed by a-z followed by a-z 0-9.  
Arguments are listed inside of `[]`, delimited by a comma(`,`)

| Example | Evaluation Result | Notes |
|--|--|--|
| `$ten` | 10 | |
| `$sum[1, 2]` | 3 | |
| `$sum[$ten, 1]` | 11 | |
| `text$ten` | text10 | |
| `$ten"text"` | 10text | |
| `$a` | $a | Not a valid variable name so treated as-is |
| `$10` | $10 | Not a valid variable name so treated as-is |


## Quotes
Quoted text is treated as-is except in the case of special characters when used as part of a variable argument.  
Outside of variable arguments, double quotes are treated as literal characters with no significant meaning


| Example   | Evaluation Result |
|-----------|--------|
| "text"    | text   |
| "text\""  | text"  |
| "text\\"  | text   |
| "text\\"" | text\" |
| "$text"   | $text  |



## $if Variable
The `$if` variable is a special variable that consists of a condition and one to two following  arguments.

When the specified condition is true, the first argument is returned as the result otherwise the second argument is returned as the result.

Variables, including `$if`, can be used in the condtion aswell as the arguments. Variables in the arguments will only be evaluated respectively of the conditions result. That is the first argument is only evalidated when the condition is true, the second argument is only evaluated when the condition is false.

You can find more info on conditions [here](./conditions.md)

| Example | Evaluation Result | Notes |
|--|--|--|
| `$if[1 === 1, yes, no]` | yes | |
| `$if[1 === 2, yes, no]` | no | |
| `$if[1 === 1, yes]` | yes | |
| `$if[1 === 2, yes]` | | Returns an empty string when a second argument is given |
| `$ten is $if[$ten > 5, greater than, less than or equal to] 5` | 10 is greater than 5 | |

## Single Character Escape Sequences
For special characters that you wish to treat as plain text, prefix them with `\`. If a `\` is encountered followed by a special character the `\` is removed and the special character is seen as plain text. Otherwise the `\` is treated as plain text

| Example | Evaluation Result | Notes |
|---------|-------------------|-------|
| `\text` | \text | Non-escape sequence so `\` is treated as plain text
| `\$var` | $var | Treats the `$` as plain text |
| `$ten\[` | 10[] | Treats the `[` as plain text. Only valid after a variable. |
| `$lowercase[TEXT\,]` | text, | Treats the `,` as plain text. Only valid in arguments |
| `$lowercase[TEXT\]]` | text] | Treats the `]` as plain text. Only valid in arguments |


## Block Escape
For a sequence of characters you wish to treat as plain text, you can wrap them in double backticks(\`). This will result in all text inside the backticks to be treated as plain text

\`\`example $text \\"\`\` is treated as the literal text `example $text \"`
