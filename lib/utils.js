exports.fullInteger = (n) => {
    return parseInt((n.toString()).replace(",", ""));
};

exports.formatCurrency = (n) => {
    return "$ " + n.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,");
}

exports.stringify = (n) => {
    const values = Object.values(n);
    return values.join(',') + '\n';
}

exports.titleCase = (n) => {
    let splitStr = n.toLowerCase().split(' ');
    for (let i = 0; i < splitStr.length; i++) {
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    // Directly return the joined string
    return splitStr.join(' ');
}