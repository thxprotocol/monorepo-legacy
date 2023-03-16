import http from 'http';
import { PORT } from './app/config/secrets';

http.createServer((req, res) => res.end("I'm healthy!")).listen(PORT, () =>
    console.log(`Server running at http://0.0.0.0:${PORT}/`),
);
