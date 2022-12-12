module.exports = {
  async up(db,) {
    console.log('pippo')
    try {
      await db.collection('erc20rewards').rename('erc20perks');
      await db.collection('erc721rewards').rename('erc721perks');
    } catch(err) {
      console.log('ERR', err)
    }
    
  },

  async down() {
    //
  }
};

