// @ts-check

const fs = require('fs');
const path = require('path');

const version = process.argv[2] || 'same';
const changelog = process.argv[3] || 'same';
const langVersion = process.argv[4] || 'same';
const PREFIX = 'VITE_';
const BUILD_KEY = PREFIX + 'BUILD';
const VERSION_KEY = PREFIX + 'VERSION';
const VERSION_FULL_KEY = PREFIX + 'VERSION_FULL';
const LANG_PACK_VERSION_KEY = PREFIX + 'LANG_PACK_VERSION';

console.log('Change version to:', {version, changelog, langVersion});

try {
  const envPath = './.env';
  
  // Read or create .env file
  let envStr = '';
  if(fs.existsSync(envPath)) {
    envStr = fs.readFileSync(envPath).toString();
  } else {
    console.warn('⚠ .env file not found, creating with defaults');
    envStr = `${VERSION_KEY}=2.2
${BUILD_KEY}=678
${VERSION_FULL_KEY}=2.2 (678)
${LANG_PACK_VERSION_KEY}=294371
VITE_MTPROTO_WORKER=1
VITE_MTPROTO_AUTO=1
VITE_MTPROTO_HAS_HTTP=1
VITE_MTPROTO_HAS_WS=1
`;
  }

  const env = {};
  envStr.split('\n').forEach(line => {
    if(!line) return;
    const [key, value] = line.split('=', 2);
    if(key) env[key] = value;
  });

  if(version !== 'same') {
    env[VERSION_KEY] = version;
  }

  env[BUILD_KEY] = (parseInt(env[BUILD_KEY]) || 0) + 1;
  env[VERSION_FULL_KEY] = `${env[VERSION_KEY]} (${env[BUILD_KEY]})`;

  if(langVersion !== 'same') {
    env[LANG_PACK_VERSION_KEY] = langVersion;
  }

  const lines = [];
  for(const key in env) {
    lines.push(`${key}=${env[key]}`);
  }
  
  fs.writeFileSync('./.env', lines.join('\n') + '\n', 'utf-8');
  
  // Create public directory if it doesn't exist
  const publicDir = './public';
  if(!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, {recursive: true});
  }
  
  fs.writeFileSync(path.join(publicDir, 'version'), env[VERSION_FULL_KEY], 'utf-8');

  if(changelog !== 'same') {
    const changelogPath = './CHANGELOG.md';
    if(fs.existsSync(changelogPath)) {
      const data = fs.readFileSync(changelogPath);
      const fd = fs.openSync(changelogPath, 'w+');
      const lines = [
        `### ${env[VERSION_FULL_KEY]}`
      ];
      changelog.trim().split('\n').forEach(line => {
        lines.push(`* ${line}`);
      });
      const insert = Buffer.from(lines.join('\n') + '\n\n');
      fs.writeSync(fd, insert, 0, insert.length, 0);
      fs.writeSync(fd, data, 0, data.length, insert.length);
      fs.closeSync(fd);
    } else {
      console.warn('⚠ CHANGELOG.md not found, skipping changelog update');
    }
  }

  console.log('✓ Version updated successfully to', env[VERSION_FULL_KEY]);
  process.exit(0);
} catch(err) {
  console.error('✗ Error changing version:', err.message);
  process.exit(1);
}
