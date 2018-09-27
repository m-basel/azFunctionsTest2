var pdf2png = require('pdf2png-mp');
var fs = require('fs');
var path = require("path");

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

    pdf2png.convert(input, { quality: 300 }, function(resp) {
        if(!resp.success) {
            context.res = {
                status: 500,
                body: "Error while converting pdf: " + resp.error
            }
            return;
        }

        var basePath = path.dirname(input);
        var baseName = path.basename(input, ".pdf");
     
        resp.data.forEach(function(item, index) {     
            var result = basePath + "\\" + baseName + "-" +index+".png";
            fs.writeFile(result, item, function (err) {
                if (err) {
                    context.res = {
                        status: 500,
                        body: "Error while creating file " + result + ": " + resp.error
                    }
                    return;
                }
                else {
                    context.res.body += result;
                    console.log("The file " + result + " was saved!");
                }
            });
        });   
    });   
    
    //todo - make the function await
    context.res.response = 200;
};