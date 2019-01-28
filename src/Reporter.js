const fs = require("fs");
const path = require("path");

class Reporter {

    /**
     * @param {string} options.json - path to json file
     * @param {string} options.targetFolder - folder to store the report
     */
    static generate(options) {
        const jsonFile = fs.readFileSync(path.resolve(options.json), "utf-8");
        let templateJS = fs.readFileSync(__dirname + "/../templates/index.js", "utf-8");
        let templateCSS = fs.readFileSync(__dirname + "/../templates/index.css", "utf-8");
        let templateHTML = fs.readFileSync(__dirname + "/../templates/index.html", "utf-8");

        templateHTML = templateHTML.replace("TEMPLATE_JSON", jsonFile);
        templateHTML = templateHTML.replace("TEMPLATE_JS", templateJS);
        templateHTML = templateHTML.replace("TEMPLATE_CSS", templateCSS);

        const targetDir = path.resolve(options.targetFolder);
        fs.writeFileSync(targetDir + "/index.html", templateHTML);
    }

}

module.exports = Reporter;
