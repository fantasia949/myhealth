const expr = "y = 2x + 3";
const keyX = "Thyroxine (x)";
const keyY = "Yeast";
let replaced = expr.replace(/\bx\b/g, keyX).replace(/^y\s*=/g, `${keyY} = `);
console.log(replaced);
