import jwt_decode from 'jwt-decode';

export const parseToken = (header: string): { sub: string } => {
    if (!header || !header.startsWith('Bearer ')) return;
    return jwt_decode(header.split(' ')[1]);
};
