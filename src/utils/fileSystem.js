const fs = require('fs');

module.exports = class fileSystem {
  static readFile(filePath, json = false) {
    const fileContent = fs.readFileSync(filePath);

    return json === true ? JSON.parse(fileContent) : fileContent;
  }

  static writeFile(filePath, content) {
    fs.writeFileSync(filePath, JSON.stringify(content), {
      encoding: 'utf8',
      flag: 'w',
    });
  }
};
