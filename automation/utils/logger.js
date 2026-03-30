function log(level, ...args) {
  const prefix = `[ShopEase QA ${level}]`;
  if (level === 'error') console.error(prefix, ...args);
  else console.log(prefix, ...args);
}

module.exports = { log };
