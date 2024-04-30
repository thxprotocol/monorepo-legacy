export class TwitterQuery {
    static parse(operators: { [key: string]: string }) {
        const ops = Object.keys(operators).reduce((obj: any, key: string) => {
            try {
                obj[key] = JSON.parse(operators[key]);
            } catch (error) {
                obj[key] = operators[key];
            }
            return obj;
        }, {}) as TTwitterOperators;
        return ops;
    }

    static stringifyField(field: string[] | string | number, isURL = false) {
        if (!field || (Array.isArray(field) && !field.length)) return;
        if (!Array.isArray(field)) return;
        const items = field.filter((value: string) => {
            return isURL ? value.length && value !== 'https://' : value.length;
        });
        if (!items.length) return;
        return JSON.stringify(items);
    }

    static stringifyFieldURL(field: string[] | string | number) {
        if (!field || (Array.isArray(field) && !field.length)) return;
        if (!Array.isArray(field)) return;
        const items = field.filter((value: string) => value.length && value !== 'https://');
        if (!items.length) return;

        return JSON.stringify(items.map((url: string) => `"https://${url}"`));
    }

    static stringify(operators: TTwitterOperators) {
        return {
            from: this.stringifyField(operators['from']),
            to: this.stringifyField(operators['to']),
            text: this.stringifyField(operators['text']),
            url: this.stringifyFieldURL(operators['url']),
            hashtags: this.stringifyField(operators['hashtags']),
            mentions: this.stringifyField(operators['mentions']),
            media: operators['media'],
        } as { [key: string]: string };
    }

    static create(operators: TTwitterOperators) {
        const operatorKeys = Object.keys(operators);
        if (!operatorKeys) return;
        const media =
            !operators['media'] || ['ignore', null].includes(operators['media']) ? '' : ` ${operators['media']}`;
        const query = operatorKeys
            .map((key: string) => {
                switch (key) {
                    case 'from': {
                        const items = operators[key] as string[];
                        if (!items) return;
                        const authors = items.map((author: string) => `from:${author}`).join(' OR ');
                        return items.length > 1 ? `(${authors})` : authors;
                    }
                    case 'to': {
                        const items = operators[key] as string[];
                        if (!items) return;
                        const authors = items.map((author: string) => `to:${author}`).join(' OR ');
                        return items.length > 1 ? `(${authors})` : authors;
                    }
                    case 'text': {
                        const items = operators[key] as string[];
                        if (!items) return;
                        const texts = items.map((value: string) => `"${value}"`).join(' OR ');
                        return items.length > 1 ? `(${texts})` : texts;
                    }
                    case 'url': {
                        const items = operators[key] as string[];
                        if (!items) return;
                        const urls = items.map((value: string) => `url:${value}`).join(' OR ');
                        return items.length > 1 ? `(${urls})` : urls;
                    }
                    case 'hashtags': {
                        const items = operators[key] as string[];
                        if (!items) return;
                        const hashtags = items.map((tag: string) => `#${tag}`).join(' OR ');
                        return (items.length > 1 ? `(${hashtags})` : hashtags) + media;
                    }
                    case 'mentions': {
                        const items = operators[key] as string[];
                        if (!items) return;
                        const mentions = items.map((tag: string) => `@${tag}`).join(' OR ');
                        return (items.length > 1 ? `(${mentions})` : mentions) + media;
                    }
                }
                return;
            })
            .filter((query) => !!query)
            .join(' ');

        return `${query} -is:retweet`;
    }
}
