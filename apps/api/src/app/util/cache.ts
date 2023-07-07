import NodeCache from 'node-cache';

const cache = new NodeCache({
    stdTTL: 3600, // 60 min
});

export { cache };
