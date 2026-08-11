const expression = "y = 2x + 0";
const keyX = "Thyroxine (x)";
const keyY = "Yeast";
console.log("With \\b: ", expression.replace(/\bx\b/g, keyX).replace(/^y\s*=/i, `${keyY} = `));
console.log("With lookbehind: ", expression.replace(/(?<=\s|\d)x\b/g, keyX).replace(/^y\s*=/i, `${keyY} = `));
console.log("With string space: ", expression.replace(/ x /g, ` ${keyX} `).replace(/^y\s*=/i, `${keyY} = `));
console.log("With plain x: ", expression.replace(/x/g, keyX).replace(/^y\s*=/i, `${keyY} = `));
