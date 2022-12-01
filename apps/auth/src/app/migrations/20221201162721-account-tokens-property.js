module.exports = {
    async up(db) {
        const accountsColl = db.collection('accounts');
        const accounts = await (await accountsColl.find({})).toArray();
        const promises = accounts.map(async (account) => {
         
            const tokens = [{
              kind: 'signup',
              accessToken: account.signupToken,
              expiry: account.signupTokenExpires,
            },
            {  
              kind: 'authentication',
              accessToken: account.twitterAccessToken,
              expiry: account.authenticationTokenExpires,
            },
            {
              kind: 'password-reset',  
              accessToken: account.googleAccessToken,
              expiry: account.passwordResetExpires,
            },
            {
              kind: 'google',
              accessToken: account.googleAccessToken,
              refreshToken: account.googleRefreshToken,
              expiry: account.googleAccessTokenExpires,
            },
            {
              kind: 'twitter',
              accessToken: account.twitterAccessToken,
              refreshToken: account.twitterRefreshToken,
              expiry: account.twitterAccessTokenExpires,
            },
            {
              kind: 'github',
              accessToken: account.githubAccessToken,
              refreshToken: account.githubAccessTokenRefresh,
            },
            {
              kind: 'verify-email',
              accessToken: account.verifyEmailToken,
              expiry: account.verifyEmailTokenExpires,
            },];
            
            accountsColl.updateOne({ _id: account._id },
              { $set: { tokens }});
            
        });
        await Promise.all(promises);
    },

    async down() {
        //
    },
};
