const DEFAULT_ELEMENTS = {
    btnBg: {
        label: 'Button',
        color: '#5942c1',
    },
    btnText: {
        label: 'Button Text',
        color: '#FFFFFF',
    },
    text: {
        label: 'Text',
        color: '#FFFFFF',
    },
    bodyBg: {
        label: 'Background',
        color: '#241956',
    },
    cardBg: {
        label: 'Card',
        color: '#31236d',
    },
    navbarBg: {
        label: 'Navigation',
        color: '#31236d',
    },
    launcherBg: {
        label: 'Launcher',
        color: '#5942c1',
    },
    launcherIcon: {
        label: 'Launcher Icon',
        color: '#ffffff',
    },
};

const DEFAULT_COLORS = {
    accent: {
        label: 'Accent',
        color: '#98D80D',
    },
    success: {
        label: 'Success',
        color: '#28a745',
    },
    warning: {
        label: 'Warning',
        color: '#ffe500',
    },
    danger: {
        label: 'Danger',
        color: '#dc3545',
    },
    info: {
        label: 'Info',
        color: '#17a2b8',
    },
};

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
