// @ts-check

const { generateFromFile } = require('./core');

(async () => {
  try {
    await generateFromFile();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
