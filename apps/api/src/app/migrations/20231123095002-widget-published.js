module.exports = {
    async up(db) {
        const widgetColl = db.collection('widgets');
        await widgetColl.updateMany({}, { $set: { isPublished: true } });
    },
    async down() {
        //
    },
};
