import { SES } from '@aws-sdk/client-ses';

const ses = new SES({
    region: 'eu-west-3',
});

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
