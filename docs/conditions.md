# Comparators
Comparators compare whats on the left side to that of the right side of the comparator.

Comparators must have a space before and after.

`1 === 1` - Valid  
`1=== 2` - Invalid  
`1 ===2` - Invalid  
`1===2` - Invalid  


| Comparator  | Example           | Description |
|:-----------:|:-----------------:|-|
| `===`       | `1 === 1`         | The left side exactly equals the right side |
| `!==`       | `1 === 2`         | The left side does not exactly equal the right side |
| `==`        | `1 == 1`          | The left side loosey equals\* the right side |
| `!=`        | `1 == 2`          | The left side does not loosey equals\* the right side |
| `<`         | `1 < 2`           | The left side is a number and less than the right side |
| `<=`        | `1 <= 1`          | The left side is a number and less than or equal to the right side |
| `>`         | `2 > 1`           | The left side is a number and greater than the right side |
| `>=`        | `1 >= 1`          | The left side is a number and greater than or equal to the right side |
| `exists`    | `1 exists`        | The left side is not null or empty text |
| `!exists`   | `"" !exists`      | The left side is null or empty text |
| `isnumber`  | `1 isnumber`      | The left side is numerical |
| `!isnumber` | `a !isnumber`     | The left side is not numerical |
| `isnumber`  | `2 isnumber 1-2`  | The left side is numerical and falls within the specified range (inclusive) |
| `!isnumber` | `3 !isnumber 1-2` | The left side is not numerical or does not fall within the specified range (inclusive) |
| `regex`     | `a regex /a/`     | The left side matches the right side's regex pattern |
| `!regex`    | `a !regex /b/`    | The left side does not match the right side's regex pattern |
| `iswcm`     | `ab iswcm a?`     | The left side matches the right side's wildcard pattern |
| `!iswcm`    | `bc !iswcm a?`    | The left side does not match the right side's wildcard pattern |
| `iswcmcs`   | `ab iswcmcs a?`   | The left side matches the right side's wildcard pattern (case-sensitive) |
| `!iswcmcs`  | `bc !iswcmcs a?`  | The left side does not match the right side's wildcard pattern (case-sensitive) |

\*: Loosey equals returns true if either:  
\- the left-side exactly equals the right-side  
\- the left-side exactly equals the right-side after converting both to lower-case  
\- the left-side is numerical and exactly equals the right side after converting both to numbers  
\- both left- and right-side values are null or string  

# Logical Operators
| Operator         | Example                 | Returns true If |
|:----------------:|:-----------------------:|-|
| `$NOT`           | `$NOT[1 == 2]`          | The comparison returned false |
| `$AND`, `$ALL`   | `$AND[1 == 1, 2 == 2]`  | All comparisions returned true |
| `$NAND`, `$NALL` | `$NAND[1 == 1, 1 == 2]` | Atleast one comparison returned false |
| `$OR`, `$ANY`    | `$OR[1 == 1, 2 == 2]`   | Atleast one comparison returned true |
| `$NOR`, `$NANY`  | `$NOR[1 == 1, 1 == 2]`  | All comparisons returned false |
