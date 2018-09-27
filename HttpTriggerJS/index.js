var pdf2png = require('pdf2png-mp');
var tmp = require('tmp');
var fs = require('fs');
var path = require("path");
var https = require('https');

const download = (context, pdfUrl) =>
    new Promise((res, rej) => {
        var filename = tmp.tmpNameSync({ postfix: '.pdf' });
        context.log('downloading to temp file: ', filename);

        var file = fs.createWriteStream(filename);
        var request = https.get(pdfUrl, function (response) {
            response.pipe(file);
            file.on('finish', function () {
                file.close(() => res(filename));
            });
        })
    });

const savePage = (context, pngFile, data) =>
    new Promise((res, rej) =>
        fs.writeFile(pngFile, data, function (err) {
            if (err)
                rej("Error while creating file " + result + ": " + resp.error)
            else
                res()
        }));

const splitPdf = (context, pdfFile) => {
    var basePath = path.dirname(pdfFile);
    var baseName = path.basename(pdfFile, ".pdf");

    return new Promise((res, rej) => {
        pdf2png.convert(pdfFile, { quality: 300 }, function (resp) {
            context.log('pdf.convert');
            if (!resp.success) {
                var message = "Error while converting pdf: " + resp.error;
                context.log(message);
                rej(message);
            }
                
            res(resp.data.length);
            /*
            resp.data.forEach(async (data, index) => {
                var pngFile = basePath + "\\" + baseName + "-" + index + ".png";
                await savePage(context, pngFile, data);
            });
            res();*/
        });
    });
}

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    //check if input file was provided
    var input = req.query.input;
    if (!input) {
        context.res = {
            status: 400,
            body: "No input file provided"
        }
        return;
    }
    context.log('PDF is ', input);

    var file = await download(context, input);
    context.log('File downloaded', file);
    var pages = await splitPdf(context, file);
    context.log('File splitted', pages);
    fs.unlinkSync(file);

    context.res = {
        status: 200,
        body: {
            pages: pages
        }
    };
}