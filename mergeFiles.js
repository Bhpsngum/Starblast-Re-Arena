// NodeJS program to merge Arena files into one runnable code

const fs = require("fs").promises;
const package = require("./package.json");
let credits;

const getContent = async function (fileName) {
    let content;
    try {
        content = await fs.readFile("./files/" + fileName, "utf-8");
    }
    catch (e) { throw "notexists" };
    let match;
    while ((match = content.match(/\/\*\simport\s(.+?)\s\*\//)) != null) {
        let index = match.index;
        let len = match[0].length;
        let args = String(match[1]).split(" "), file = args.shift();
        content = content.slice(0, index) + "\n\n" + (args.map(e => e.toLowerCase()).includes("notimestamp") ? "" : `/* Imported from ${file} at ${new Date().toString()} */\n\n`) + await getContent(file) + "\n\n" + content.slice(index + len, content.length);
    }
    return content;
}

const getTemplateContent = async function (template_name) {
    try {
        return await getContent("templates/" + template_name + ".js");
    }
    catch (e) {
        if ("notexists" == e) throw `Can't find template named '${template_name}'`;
        throw e;
    }
}

const compile = async function (template_name) {
    let content;
    try {
        content = await getTemplateContent(template_name);
    }
    catch (e) {
        if ("string" == typeof e) return console.log(e);
        return console.error(`Failed to parse content in template '${template_name}'. Caught`, e);
    }

    let outputFileName = package.name + "_v" + package.version + "_" + template_name + ".js";

    if (credits == null) credits = await fs.readFile("./files/Credits.js", "utf-8");
    
    try {
        await fs.writeFile("./" + outputFileName, credits + "\n\n" + content);
    }
    catch (e) { return console.error(`Failed to write to file '${outputFileName}'. Caught`, e) }

    console.log("Write successfully to", outputFileName);
}

const compileMultipleFiles = async function (templates) {
    for (let template of templates) await compile(template);
}

compileMultipleFiles(process.argv.slice(2));