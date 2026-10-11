// Usage: node validate.js <batchDir> <bNNN>
// Checks bNNN.zh.json against bNNN.json: every id present, ICU parses, same arguments, same tags.
const fs = require('fs');
const path = require('path');
const { parse, TYPE } = require('@formatjs/icu-messageformat-parser');
const [, , dir, name] = process.argv;
const src = JSON.parse(fs.readFileSync(path.join(dir, name + '.json'), 'utf8'));
let out;
try { out = JSON.parse(fs.readFileSync(path.join(dir, name + '.zh.json'), 'utf8')); }
catch (e) { console.log('FAIL: cannot read/parse ' + name + '.zh.json: ' + e.message); process.exit(1); }

function sig(msg) {
  const args = new Set(), tags = new Set();
  const walk = els => {
    for (const el of els) {
      if (el.type === TYPE.argument || el.type === TYPE.number || el.type === TYPE.date || el.type === TYPE.time) args.add(el.value + ':' + el.type);
      if (el.type === TYPE.plural || el.type === TYPE.select) {
        args.add(el.value + ':' + el.type);
        for (const [opt, o] of Object.entries(el.options)) { args.add(el.value + '#' + opt); walk(o.value); }
      }
      if (el.type === TYPE.tag) { tags.add(el.value); walk(el.children); }
    }
  };
  walk(parse(msg, { ignoreTag: false }));
  return [...args].sort().join('|') + ' / ' + [...tags].sort().join('|');
}

const errs = [];
for (const [id, key, en] of src) {
  const zh = out[id] ?? out[String(id)];
  if (typeof zh !== 'string' || !zh.trim()) { errs.push(`${id}: missing translation`); continue; }
  let a, b;
  try { a = sig(en); } catch (e) { a = null; }
  if (a === null) continue; // source itself is not valid ICU; skip structural check
  try { b = sig(zh); } catch (e) { errs.push(`${id}: ICU syntax error in translation (${e.message}): ${zh}`); continue; }
  if (a !== b) errs.push(`${id}: placeholders/plural branches/tags differ. source=${a}  translation=${b}`);
}
const extra = Object.keys(out).filter(k => !src.some(([id]) => String(id) === k));
if (extra.length) errs.push('unexpected ids: ' + extra.join(','));
if (errs.length) { console.log(`FAIL ${name}: ${errs.length} problem(s)\n` + errs.slice(0, 60).join('\n')); process.exit(1); }
console.log(`OK ${name}: ${src.length} strings`);
