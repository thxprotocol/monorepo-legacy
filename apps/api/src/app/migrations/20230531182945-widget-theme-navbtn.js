module.exports = {
    async up(db) {
        const widgetsColl = db.collection('widgets');
        const widgets = await widgetsColl.find({});

        for (const widget of await widgets.toArray()) {
            try {
                const theme = JSON.parse(widget.theme);

                theme.elements['navbarBtnBg'] = { label: 'Navigation Button', color: theme.elements.btnBg.color };
                theme.elements['navbarBtnText'] = {
                    label: 'Navigation Button Text',
                    color: theme.elements.btnText.color,
                };

                await widgetsColl.updateOne({ _id: widget._id }, { $set: { theme: JSON.stringify(theme) } });
            } catch (error) {
                console.log(error);
            }
        }
    },

    async down() {
        //
    },
};
