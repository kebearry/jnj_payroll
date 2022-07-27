const { formatCurrency, titleCase } = require('./utils');
const { cdacThresholds, ecfThresholds, mbmfThresholds, sindaThresholds } = require('../data/shg')
const { sendPayslipMail } = require('./mailer');
const moment = require('moment');

const getCpfContributionRate = (age) => {
    let cpfContributionRate = 0.2;
    if (age > 70) {
        cpfContributionRate = 0.05;
    } else if (age > 55 && age <= 60) {
        cpfContributionRate = 0.14;
    } else if (age > 60 && age <= 65) {
        cpfContributionRate = 0.085;
    } else if (age > 65 && age <= 70) {
        cpfContributionRate = 0.06;
    }
    return cpfContributionRate
}

const getSHG = (race) => {
    let shg = "";
    if (race.toLowerCase().replace(/\s/g, "") === 'chinese') {
        shg = "cdac";
    } else if (race.toLowerCase().replace(/\s/g, "") === 'eurasian') {
        shg = "ecf"
    } else if (race.toLowerCase().replace(/\s/g, "") === 'malay') {
        shg = "mbmf"
    } else if (race.toLowerCase().replace(/\s/g, "") === 'indian') {
        shg = "sinda"
    }
    return shg;
}

const getSHGcontribution = (monthlySalary, race) => {
    let shgContribution = 0;
    let sortedThresholds = [];
    if (getSHG(race).toLowerCase() === 'cdac') {
        sortedThresholds = cdacThresholds.sort((a, b) => b.wage - a.wage)
        shgContribution = (sortedThresholds.find(threshold => threshold.wage < monthlySalary)).contribution;
    } else if (getSHG(race).toLowerCase() == 'ecf') {
        sortedThresholds = ecfThresholds.sort((a, b) => b.wage - a.wage)
        shgContribution = (sortedThresholds.find(threshold => threshold.wage < monthlySalary)).contribution;
    } else if (getSHG(race).toLowerCase() === 'mbmf') {
        sortedThresholds = mbmfThresholds.sort((a, b) => b.wage - a.wage)
        shgContribution = (sortedThresholds.find(threshold => threshold.wage < monthlySalary)).contribution;
    } else if (getSHG(race).toLowerCase() === 'sinda') {
        sortedThresholds = sindaThresholds.sort((a, b) => b.wage - a.wage)
        shgContribution = (sortedThresholds.find(threshold => threshold.wage < monthlySalary)).contribution;
    }
    return shgContribution;
}
exports.getSHGcontribution = getSHGcontribution;

const getCpfContribution = (monthlySalary, age) => {
    const cpfContributionRate = getCpfContributionRate(age);
    return (cpfContributionRate * monthlySalary);
}
exports.getCpfContribution = getCpfContribution;

const checkFormat = function (obj) {
    const keysCount = Object.keys(obj).length;
    if (keysCount !== 9) {
        return false;
    }
    const monthlySalary = parseInt(obj.monthly_salary);
    return !(isNaN(monthlySalary));
}


const getNetIncome = (monthlySalary, age, race) => {
    const cpfContribution = getCpfContribution(monthlySalary, age);
    const shgContribution = getSHGcontribution(monthlySalary, race);
    return (formatCurrency(monthlySalary - cpfContribution - shgContribution));
}
exports.getNetIncome = getNetIncome;

exports.convert = (obj) => {
    if (!checkFormat(obj)) {
        return false;
    }
    const monthlySalary = parseInt(obj.monthly_salary);
    const name = obj.first_name + ' ' + obj.last_name;
    const netIncome = getNetIncome(monthlySalary, obj.age, obj.race);
    const cpfContribution = getCpfContribution(monthlySalary, obj.age)
    const shgContribution = getSHGcontribution(monthlySalary, obj.race)

    // Return the converted object
    return {
        name: name,
        department: titleCase(obj.department),
        grossIncome: formatCurrency(monthlySalary),
        netIncome: netIncome,
        cpfContribution: formatCurrency(cpfContribution),
        shgContribution: formatCurrency(shgContribution),
        email: (obj.email).toLowerCase()
    };
}

const sendEmail = async (data) => {
    console.log(data)
    let body = {};
    const generatedMonth = moment().format("MMMM, YYYY")
    body.generatedMonth = generatedMonth;
    let emailData = {
        title: `JNJ payslip for ${generatedMonth}`,
        name: data.name,
        generatedMonth: generatedMonth,
        grossIncome: data.grossIncome,
        employeeCPF: data.cpfContribution,
        additionalDeduction: data.shgContribution,
        netIncome: data.netIncome
    };
    let options = {
        subject: emailData.title,
        to: data.email,
        data: emailData
    };
    let result = await sendPayslipMail(options);
    return { success: true, to: options.to, type: result.type, url: result.url };
}
exports.sendEmail = sendEmail;