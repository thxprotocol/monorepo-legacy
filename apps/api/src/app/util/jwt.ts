import jwt_decode from 'jwt-decode';

export const parseToken = (header: string): { sub: string; client_id: string } => {
    if (!header || !header.startsWith('Bearer ')) return;
    return jwt_decode(header.split(' ')[1]);
};
