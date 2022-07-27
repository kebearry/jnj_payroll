exports.ethereal = { // all emails are catched by ethereal.email (development)
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: "gertrude.moen59@ethereal.email", // generated ethereal user
        pass: "J6WTbnAQcYrduYZCYx" // generated ethereal password
    },
}
exports.mailtrap = { // all emails are catched by mailtrap.io (development)
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "ccdf7d0a019e2c",
        pass: "ef7c426f1cc2b8"
    }
}
