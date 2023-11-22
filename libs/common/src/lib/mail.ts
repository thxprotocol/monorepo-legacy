import AWS from 'aws-sdk';

AWS.config.update({ region: 'eu-west-3' });

const ses = new AWS.SES();

function sendMail(to: string, subject: string, html: string) {
    ses.sendEmail(
        {
            Destination: { ToAddresses: [to] },
            Message: {
                Body: {
                    Html: {
                        Charset: 'UTF-8',
                        Data: html,
                    },
                },
                Subject: {
                    Charset: 'UTF-8',
                    Data: subject,
                },
            },
            Source: 'THX Network <noreply@thx.network>',
        },
        console.log,
    );
}

export { ses, sendMail };
