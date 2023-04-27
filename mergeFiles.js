// NodeJS program to merge Arena files into one runnable code

const fs = require("fs").promises;
const template_file = "templates/base.js";
const destination_file_name = "Arena_mod_v4.0_compiled.js";

const getContent = async function (fileName) {
    let content = await fs.readFile("./files/" + fileName, "utf-8");
    let match;
    while ((match = content.match(/\/\*\simport\s(.+?)\s\*\//)) != null) {
        let index = match.index;
        let len = match[0].length;
        let file = match[1];
        content = content.slice(0, index) + `\n\n/* Imported from ${file} at ${new Date().toString()} */\n\n` + await getContent(file) + content.slice(index + len, content.length);
    }
    return content;
}

getContent(template_file).then(content => {
    fs.writeFile(destination_file_name, content)
    .then(e => console.log("Write successfully to", destination_file_name))
    .catch(e => console.error("Failed to write to file. Caught Error:", e));
}).catch(e => console.error("Failed to parse content. Caught Error:", e));