const { DEFAULT_ELEMENTS, DEFAULT_COLORS } = require('../../../../libs/common/src/lib/types/contants');

module.exports = {
    async up(db) {
        const widgetsColl = db.collection('widgets');
        const widgets = await widgetsColl.find({});

        for await (const widget of widgets) {
            const theme = { elements: DEFAULT_ELEMENTS, colors: DEFAULT_COLORS };
            if (widget.bgColor) {
                theme.elements.launcherBg = { label: 'Launcher', color: widget.bgColor };
            }
            if (widget.color) {
                theme.elements.launcherIcon = { label: 'Launcher Icon', color: widget.color };
            }

            await widgetsColl.updateOne(
                { _id: widget._id },
                { $set: { theme: JSON.stringify(theme) }, $unset: { color: true, bgColor: true } },
            );
        }
    },

    async down() {
        //
    },
};
