const fs = require('fs');
const html = fs.readFileSync('educacao-ambiental.html', 'utf8');
const voidTags = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
const stack = [];
const errors = [];
const tagRegex = /<\/?([a-zA-Z0-9_-]+)([^>]*)>/g;
let match;
while ((match = tagRegex.exec(html)) !== null) {
  const tag = match[1].toLowerCase();
  const isClose = html[match.index + 1] === '/';
  if (isClose) {
    if (stack.length === 0) {
      errors.push(`unexpected closing </${tag}> at ${match.index}`);
      continue;
    }
    const expected = stack.pop();
    if (expected !== tag) errors.push(`expected </${expected}> but got </${tag}> at ${match.index}`);
  } else if (!voidTags.has(tag)) {
    stack.push(tag);
  }
}
console.log('errors', errors);
console.log('unclosed tail', stack.slice(-20));
