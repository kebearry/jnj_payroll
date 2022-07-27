const express = require('express');
const sls = require('serverless-http')
const fs = require('fs');
const { parse } = require('csv-parse');
const { transform } = require('stream-transform');
const { convert, sendEmail } = require('./lib/payslip');
const cron = require("node-cron");
const { stringify } = require('./lib/utils');
const path = require('path');
const argv = require('optimist')
    .usage('Usage: $0 --input [file]')
    .alias('input', 'i')
    .alias('output', 'o')
    .describe('input', 'The input csv file.')
    .describe('output', 'The output csv file, default output command line.')
    .argv;

let inputFile = path.resolve(__dirname, 'sample.csv');
let input = fs.createReadStream(inputFile);
let writable;
let convertedRecords = [];

const app = express()

const parser = parse({
    columns: ['first_name', 'last_name', 'race', 'gender', 'job_title', 'department', 'monthly_salary', 'age', 'email'],
    relax_column_count: true,
    skip_empty_lines: true
});

const transformer = transform(function (record, callback) {
    const converted = convert(record);
    if (converted) {
        convertedRecords.push(converted);
        return callback(null, stringify(converted));
    }
});

// If executing this app by CLI
if (argv.input !== undefined) {
    let output = process.stdout;
    if (argv.output) {
        output = fs.createWriteStream(path.resolve(__dirname, argv.output));
    }
    writable = input.pipe(parser)
        .pipe(transformer)
        .pipe(output)
    writable.on('finish', function () {
        sendEmailToEmployees(convertedRecords);
    });
}

app.use(express.static(__dirname));
app.get('/', async (_req, res) => {
    res.sendFile(__dirname + "/index.html");
})

const sendEmailToEmployees = async (data) => {
    for (const element of data) {
        await sendEmail(element)
    }
}

const processPayslips = async (res) => {
    writable = input.pipe(parser)
        .pipe(transformer)
    writable.on('finish', async function () {
        await sendEmailToEmployees(convertedRecords);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end("<head><link rel='stylesheet' href='app.css'></head><div class='container'><b>Successfully sent payslips!</b></div>");
    })
}
app.post("/", (_req, res) => {
    try {
        processPayslips(res);
    } catch (err) {
        res.send(err);
    }
});

cron.schedule("0 0 1 * *", function () {
    writable = input.pipe(parser)
        .pipe(transformer)
    writable.on('finish', async function () {
        sendEmailToEmployees(convertedRecords);
    })
});

module.exports.server = sls(app)