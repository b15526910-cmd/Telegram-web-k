const fs = require('fs');
const path = require('path');

const f = (key, value, plural) => {
  value = value
  .replace(/\n/g, '\\n')
  .replace(/"/g, '\\"');
  return `"${key}${plural ? '_' + plural.replace('_value', '') : ''}" = "${value}";\n`;
};

let out = '';

const outDir = path.join(__dirname, './out');

// Ensure out directory exists
if(!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, {recursive: true});
}

try {
  ['lang', 'langSign'].forEach(part => {
    const filePath = path.join(__dirname, `../${part}.ts`);

    let str = fs.readFileSync(filePath).toString()
    .replace(/\s+\/\/.+/g, '')
    // .replace(/\\'/g, '')
    .replace(/"/g, `\\"`)
    // .replace(/'/g, '"')
    .replace(/([^\\])'/g, '$1"')
    .replace(/\\'/g, '\'')
    // .replace(/"(.+?)(?:")(.*?)"/g, '"$1\"$2"');
    {
      const pattern = '= {';
      str = str.slice(str.indexOf(pattern) + pattern.length - 1);
    }

    {
      const pattern = '};';
      str = str.slice(0, str.indexOf(pattern) + pattern.length - 1);
    }

    // console.log(`'${str}'`);
    // var idx = 21865;
    // idx -= 1;
    // console.log(str.slice(idx, idx + 100));
    const json = JSON.parse(str);
    // console.log(json);

    for(const key in json) {
      const value = json[key];
      if(typeof(value) === 'string') {
        out += f(key, value);
      } else {
        for(const plural in value) {
          out += f(key, value[plural], plural);
        }
      }
    }
  });

  fs.writeFileSync(path.join(__dirname, './out/langPack.strings'), out);
  console.log('✓ Language pack formatted successfully');
  process.exit(0);
} catch(err) {
  console.error('✗ Error formatting language pack:', err.message);
  process.exit(1);
}
