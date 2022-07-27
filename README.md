# Payslip Generation and Mail Service

## Description
![Payslip Generation Preview](https://i.imgur.com/2LEVy6f.png)
![Email Preview](https://i.imgur.com/wuQS8PC.png)
This is a pure nodeJS solution to solution to generate and communicate payslip for every employee. While this is an automated cron job that has been scheduled once a month on the first day of the month at 00.00, this UI is for demonstration purpose to trigger the payslip generation and sending of emails.  A live environment for this app can be accessed at [Payslip Generator](https://5rd9wixb27.execute-api.ap-southeast-1.amazonaws.com/dev/)

### Technical Contraints
* AWS Free Tier Limit
* MailTrap Free Tier Limit (<500 total emails to be sent and throttled email per second)

### Packages Used and Purposes Behind Them
| Name             | Purpose                                                  |
| ---------------- | -------------------------------------------------------- |
| csv-parse        | parser to convert CSV text input into arrays or objects. |
| email-templates  | send custom email templates for nodeJS                   |
| express          | nodeJS web application framework                         |
| lodash           | web development facilitator with ootb utility functions  |
| moment           | JS date library for date utility functions               |
| node-cron        | task scheduler                                           |
| nodemailer       | facilitates email sending                                |
| html-to-text     | generates text content from html for nodemailer emails   |
| optimist         | parse CLI arguments                                      |
| pug              | template engine for nodeJS                               |
| serverless-http  | deploy nodeJS code to cloud infrastructure               |
| stream-transform | object transformation for stream data                    |

---
## How to run:
1) Open terminal and clone this project :

   `git clone https://github.com/kebearry/jnj_payroll.git`

2) Change directory to this project directory in terminal :

   `npm install`

   This will install dependencies, including node_modules.
   
   ##### Once you have done step 1 and 2, you don't have to do it again when you want to run this app.

3) Run the project :
   ### Two ways to run the project
   `Through https://5rd9wixb27.execute-api.ap-southeast-1.amazonaws.com/dev`
   or through invoking through Command Line Interface:
   `node app.js --input sample.csv --output output.csv`
   >> The second method will modify the output.csv in root folder

---

## Code structure:
📦.serverless
 ┣ 📜cloudformation-template-create-stack.json
 ┣ 📜cloudformation-template-update-stack.json
 ┣ 📜serverless-nodejs-app.zip
 ┗ 📜serverless-state.json
📦assets
 ┗ 📜favico.jpg
📦data
 ┣ 📜shg.js
 ┗ 📜template.js
📦lib
 ┣ 📂templates
 ┃ ┣ 📂assets
 ┃ ┃ ┗ 📜template.css
 ┃ ┣ 📂components
 ┃ ┃ ┗ 📜title.pug
 ┃ ┣ 📂layouts
 ┃ ┃ ┗ 📜main.pug
 ┃ ┗ 📜payslip.pug
 ┣ 📜mailer.js
 ┣ 📜payslip.js
 ┗ 📜utils.js
 📜app.css
 📜app.js
 📜config.js
 📜fullsample.csv
 📜index.html
 📜output.csv
 📜sample.csv
 📜serverless.yml

---
 ## How Cloud Deployment Was Done
 1) AWS CloudFormation template is created from serverless.yml
 2) If a Stack has not yet been created, then it is created with no resources except for an S3 Bucket, which will store zip files of the function code
 3) The code of the function(s) is then packaged into zip files.
 4) Serverless fetches the hashes for all files of the previous deployment (if any) and compares them against the hashes of the local files
 5) Serverless terminates the deployment process if all file hashes are the sam
 6) Zip files of functions' code are uploaded to S3 Bucket.
 7) The CloudFormation Stack is updated with the new CloudFormation template
 8) Each deployment publishes a new version for each function in your service
 9) Handler defines what function to execute upon lambda invocation
 10) This serverless approach has created a lambda function with respective api gateways and cloudwatch logging mechanism