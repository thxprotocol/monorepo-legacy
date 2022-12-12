module.exports = {
  async up(db,) {
 
    const collections = await (await db.listCollections().toArray());

    // erc20rewards
    if(collections.find(x => x.name === 'erc20rewards')) {
      const erc20rewardsColl = db.collection('erc20rewards');

      if(!collections.find(x => x.name === 'erc20perks')) {
        await erc20rewardsColl.rename('erc20perks');
        console.log('RENAMED COLLECTION erc20rewards TO erc20perks');
      } else {
        console.log('COLLECTION erc20perks ALREADY EXISTS');
        const erc20perksColl = db.collection('erc20perks');
        const rows = await (await erc20rewardsColl.find({})).toArray();
        const promises = rows.map(async (row) => {
          if((await (await erc20rewardsColl.find({uuid: row.uuid})).toArray()).length > 0) {
            await erc20perksColl.insertOne(row)
          }
        });
        await Promise.all(promises);
        console.log(`COPIED erc20rewards ROWS TO erc20perks`);
      }
    }

    // erc721rewards
    if(collections.find(x => x.name === 'erc721rewards')) {
      const erc721rewardsColl = db.collection('erc721rewards');

      if(!collections.find(x => x.name === 'erc721perks')) {
        await erc721rewardsColl.rename('erc721perks');
        console.log('RENAMED COLLECTION erc721rewards TO erc20perks');
      } else {
        console.log('COLLECTION erc721perks ALREADY EXISTS');
        const erc721perksColl = db.collection('erc721perks');
        const rows = await (await erc721rewardsColl.find({})).toArray();

        const promises = rows.map(async (row) => {
          if((await (await erc721rewardsColl.find({uuid: row.uuid})).toArray()).length > 0) {
            await erc721perksColl.insertOne(row)
          }
        });
        await Promise.all(promises);
        console.log(`COPIED erc721rewards ROWS TO erc721perks`)
      }
    }
  },

  async down() {
    //
  }
};

