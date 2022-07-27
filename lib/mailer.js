const nodemailer = require('nodemailer');
const { ethereal, mailtrap } = require('../config');
const _ = require('lodash');
const moment = require('moment');
const { htmlToText } = require('nodemailer-html-to-text');
const Email = require('email-templates');
const { payslip } = require('../data/template');
const path = require('path');

let mailer = {
    from: '"Employee Payslip" <hrsupport@jnj.com>',
    smtp: ethereal // all emails are catched by ethereal.email
};

if (mailtrap.auth.user) {
    mailer.smtp = mailtrap;
}

const send = (options) => {
    const transporter = nodemailer.createTransport(mailer.smtp);
    transporter.use("compile", htmlToText());

    options.to = _.isArray(options.to) ? options.to[0] : options.to;

    return new Promise((resolve, reject) => {
        transporter.sendMail(options, (err, info) => {
            if (err) {
                console.warn("Unable to send email: ", err);
                reject(err);
            } else {
                console.info("Email message sent.", info.response);

                if (transporter.options &&
                    transporter.options.host &&
                    transporter.options.host.includes('ethereal')) {
                    return resolve({ type: 'ethereal', url: nodemailer.getTestMessageUrl(info) });
                }

                return resolve(info);
            }
        });
    });
}

const email = new Email({
    views: {
        root: path.join(__dirname, 'templates')
    },
    juice: true,
    juiceResources: {
        preserveImportant: true,
        webResources: {
            relativeTo: path.join(__dirname, 'templates')
        }
    },
    i18n: {},
});

const renderEmailTemplate = async (templateName, data) => {

    if (typeof templateName !== "string") {
        throw new Error("First parameter must be a string!");
    }

    let localData = payslip[templateName];
    let defaultData = defaultTemplateData();

    if (!localData) {
        throw new Error(`Invalid template name: ${templateName}!. template name must be mention inside template-data.js file.`);
    }

    Object.assign(localData, data, defaultData);

    try {
        return await email.render(templateName, localData);
    } catch (err) {
        console.error(err)
        throw err;
    }
};

const defaultTemplateData = (data) => {

    data = data || {};

    data.locale = data.locale || "en";
    data.site = data.site || '';
    data._ = _;
    data.moment = moment;
    data.copyrightYear = (new Date()).getFullYear();

    return data;

};

const sendPayslipMail = async (body) => {
    let data = body.data || {};

    let options = {
        from: body.from || mailer.from,
        to: body.to,
        subject: body.subject,
        'o:tag': ['payslip'],
    };

    options.html = await renderEmailTemplate('payslip', data);

    if (body.cc) {
        options.cc = body.cc;
    }

    return send(options);
}
exports.sendPayslipMail = sendPayslipMail;