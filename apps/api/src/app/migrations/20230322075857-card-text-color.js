module.exports = {
    async up(db) {
        const widgetsColl = db.collection('widgets');
        for await (const widget of await widgetsColl.find({})) {
            const theme = JSON.parse(widget.theme);
            theme.elements['cardText'] = {
                label: 'Card Text',
                color: '#FFFFFF',
            };
            await widgetsColl.updateOne(
                { _id: widget._id },
                {
                    $set: {
                        theme: JSON.stringify(theme),
                        domain: widget.domain || 'https://www.example.com',
                        message: widget.message || '',
                    },
                },
            );
        }
    },

    async down() {
        //
    },
};
