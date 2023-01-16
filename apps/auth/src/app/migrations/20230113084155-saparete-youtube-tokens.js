const axios = require('axios');
module.exports = {
  async up(db, client) {
    const accountsColl = db.collection('accounts');
    const accounts = await (await accountsColl.find({
      tokens: {
        $elemMatch: {
          kind: "google",
          accessToken: {$ne:null}
        }
      }
    })).toArray();
    
    
    const promises = accounts.map(async account => {
      const tokens = account.tokens.filter(x => x.kind === 'google' && x.accessToken && x.accessToken.length);
      for(let i=0; i< tokens.length; i++) {
          let data;
          try {
            // from: YoutubeService.getScopesOfAccessToken
            const r = await axios({
              url: `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${tokens[i].accessToken}`,
          });
            data = r.data
          } catch(err) {
            console.log('Could not call google apis, update skipped', err.message)
          }
          
          if(data) {
            let scopes = data['scope'];
            if (!scopes || !scopes.length) {
              continue;
            }

            const openid = 'openid';
            const empty = '';
            scopes = scopes.replace(openid, empty).trim();
            
            let tokenKind;
            if (scopes === 'https://www.googleapis.com/auth/youtube.readonly') {
              tokenKind = 'youtube-view';
            } else if (scopes === 'https://www.googleapis.com/auth/youtube') {
              tokenKind = 'youtube-manage';
            } else {
              continue
            }
            const result = await accountsColl.updateOne({
              "_id": account._id,
              "tokens._id": tokens[i]._id
            },
            {
              $set: {
                "tokens.$[pr].kind": tokenKind
              }
            },
            {
              arrayFilters: [
                {
                  "pr._id": tokens[i]._id
                }
              ]
            });
            console.log('ACCOUNT UPDATE RESULT:', {token: tokens[i], tokenKind, result})
          }
      }
    })
    await Promise.all(promises);
  },

  async down() {
    //
  }
};
