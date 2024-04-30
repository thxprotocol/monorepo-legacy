const { ObjectId } = require('mongodb');

const createQuery = (operators) => {
    const operatorKeys = Object.keys(operators);
    if (!operatorKeys) return;
    const media = !operators['media'] || ['ignore', null].includes(operators['media']) ? '' : ` ${operators['media']}`;
    const query = operatorKeys
        .map((key) => {
            switch (key) {
                case 'from': {
                    const items = operators[key];
                    if (!items) return;
                    const authors = items.map((author) => `from:${author}`).join(' OR ');
                    return items.length > 1 ? `(${authors})` : authors;
                }
                case 'to': {
                    const items = operators[key];
                    if (!items) return;
                    const authors = items.map((author) => `to:${author}`).join(' OR ');
                    return items.length > 1 ? `(${authors})` : authors;
                }
                case 'text': {
                    const items = operators[key];
                    if (!items) return;
                    const texts = items.map((value) => `"${value}"`).join(' OR ');
                    return items.length > 1 ? `(${texts})` : texts;
                }
                case 'url': {
                    const items = operators[key];
                    if (!items) return;
                    const urls = items.map((value) => `url:${value}`).join(' OR ');
                    return items.length > 1 ? `(${urls})` : urls;
                }
                case 'hashtags': {
                    const items = operators[key];
                    if (!items) return;
                    const hashtags = items.map((tag) => `#${tag}`).join(' OR ');
                    return (items.length > 1 ? `(${hashtags})` : hashtags) + media;
                }
                case 'mentions': {
                    const items = operators[key];
                    if (!items) return;
                    const mentions = items.map((tag) => `@${tag}`).join(' OR ');
                    return (items.length > 1 ? `(${mentions})` : mentions) + media;
                }
            }
            return;
        })
        .filter((query) => !!query)
        .join(' ');

    return `${query} -is:retweet`;
};

module.exports = {
    async up(db, client) {
        const questColl = db.collection('questsocial');
        const quests = await questColl.find({ interaction: 6 }).toArray();

        for (const quest of quests) {
            if (!quest.contentMetadata) continue;
            try {
                const metadata = JSON.parse(quest.contentMetadata);
                const operators = {
                    text: [quest.content],
                };
                const query = createQuery(operators);
                const contentMetadata = JSON.stringify({
                    ...metadata,
                    query,
                    operators,
                });

                await questColl.updateOne({ _id: quest._id }, { $set: { content: query, contentMetadata } });
            } catch (error) {
                console.log(error);
            }
        }
    },

    async down(db, client) {
        //
    },
};
