import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId, ERC20Type } from '@thxnetwork/common/enums';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { isAddress } from 'ethers/lib/utils';
import { dashboardAccessToken } from '@thxnetwork/api/util/jest/constants';
import { createImage } from '@thxnetwork/api/util/jest/images';
import { toWei } from 'web3-utils';

const http = request.agent(app);

describe('ERC20', () => {
    const totalSupply = toWei('1000'),
        name = 'Test Token',
        symbol = 'TTK';
    let tokenAddress: string, tokenName: string, tokenSymbol: string, erc20Id: string;

    beforeAll(beforeAllCallback);
    afterAll(afterAllCallback);

    describe('POST /erc20', () => {
        it('Able to create unlimited token and return address', (done) => {
            http.post('/v1/erc20')
                .set('Authorization', dashboardAccessToken)
                .send({
                    name: 'Test Token',
                    symbol: 'TTK',
                    chainId: ChainId.Hardhat,
                    totalSupply: 0,
                    type: ERC20Type.Unlimited,
                })
                .expect(({ body }: request.Response) => {
                    expect(body._id).toBeDefined();
                    expect(isAddress(body.address)).toBe(true);
                })
                .expect(201, done);
        });

        it('Able to create limited token and return address', async () => {
            const image = createImage();
            await http
                .post('/v1/erc20')
                .set('Authorization', dashboardAccessToken)
                .attach('file', image, {
                    filename: 'test.jpg',
                    contentType: 'image/jpg',
                })
                .field({
                    name,
                    symbol,
                    chainId: ChainId.Hardhat,
                    totalSupply,
                    type: ERC20Type.Limited,
                })
                .expect(({ body }: request.Response) => {
                    expect(isAddress(body._id)).toBeDefined();
                    expect(isAddress(body.address)).toBe(true);
                    expect(body.logoImgUrl).toBeDefined();
                    erc20Id = body._id;
                    tokenAddress = body.address;
                    tokenName = body.name;
                    tokenSymbol = body.symbol;
                })
                .expect(201);
        });

        it('Able to return list of created token', (done) => {
            http.get('/v1/erc20')
                .set('Authorization', dashboardAccessToken)
                .expect(({ body }: request.Response) => {
                    expect(body.length).toEqual(2);
                })
                .expect(200, done);
        });

        it('Able to return a created token', (done) => {
            http.get('/v1/erc20/' + erc20Id)
                .set('Authorization', dashboardAccessToken)
                .expect(({ body }: request.Response) => {
                    expect(body).toBeDefined();
                    expect(isAddress(body.address)).toBe(true);
                    expect(body.type).toBe(ERC20Type.Limited);
                    expect(body.totalSupplyInWei).toBe(totalSupply);
                    expect(body.name).toBe(name);
                    expect(body.symbol).toBe(symbol);
                    expect(body.decimals).toBe(18);
                })
                .expect(200, done);
        });
    });

    describe('PATCH /erc20', () => {
        it('should to update a created token', (done) => {
            http.patch('/v1/erc20/' + erc20Id)
                .set('Authorization', dashboardAccessToken)
                .send()
                .expect(({ body }: request.Response) => {
                    expect(body).toBeDefined();
                })
                .expect(200, done);
        });
    });
    describe('DELETE /erc20/:id', () => {
        it('Able to delete created token', (done) => {
            http.delete('/v1/erc20/' + erc20Id)
                .set('Authorization', dashboardAccessToken)
                .expect(204, done);
        });
    });

    describe('POST /erc20/preview', () => {
        it('should return name symbol and total supply of an oncChain ERC20Token', (done) => {
            http.get('/v1/erc20/preview')
                .set('Authorization', dashboardAccessToken)
                .query({
                    chainId: ChainId.Hardhat,
                    address: tokenAddress,
                })
                .send()
                .expect(({ body }: request.Response) => {
                    expect(body).toBeDefined();
                    expect(body.name).toBe(tokenName);
                    expect(body.symbol).toBe(tokenSymbol);
                    expect(body.totalSupplyInWei).toBe(totalSupply);
                })
                .expect(200, done);
        });
    });
});
