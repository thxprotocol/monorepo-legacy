module.exports = {
    async up(db) {
        const widgetsColl = db.collection('widgets');
        const widgets = await widgetsColl.find({});

        for await (const widget of widgets) {
            try {
                const theme = JSON.parse(widget.theme);
                theme.elements.navbarBtnBg = theme.elements.btnBg;
                theme.elements.navbarBtnText = theme.elements.btnText;
                await widgetsColl.updateOne({ _id: widget._id }, { $set: { theme: JSON.stringify(theme) } });
            } catch (error) {
                console.error(error);
            }
        }
    },

    async down() {
        //
    },
};
