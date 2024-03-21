import { TokenInstanceKey, createValidDTO, TransferTokenDto } from '@gala-chain/api';
import { plainToInstance } from 'class-transformer';
import { BigNumber } from 'bignumber.js';
import axios from 'axios';
import { NODE_ENV } from '../config/secrets';
import { logger } from '../util/logger';
import { BadRequestError } from '../util/errors';

const isProd = NODE_ENV === 'production';
const GALACHAIN_URL = isProd ? 'https://gateway.stage.galachain.com/api/hackathon20' : 'http://localhost:8801/invoke';

export default class GalachainService {
    static async createTransferDto(options: { to: string; amount: string; token: TGalachainToken }) {
        const tokenInstance = plainToInstance(TokenInstanceKey, options.token);
        return await createValidDTO<TransferTokenDto>(TransferTokenDto, {
            to: `eth|${options.to}`,
            tokenInstance,
            quantity: new BigNumber(options.amount) as any,
        });
    }

    static async invokeContract(options: { contract: TGalachainContract; dto: TransferTokenDto; privateKey: string }) {
        const url = new URL(GALACHAIN_URL);
        url.pathname = `${url.pathname}/${options.contract.channelName}/${options.contract.chaincodeName}`;

        // console.log(url.toString(), {
        //     method: 'GalaChainToken:TransferToken',
        //     args: [JSON.stringify(options.dto.signed(options.privateKey))],
        // });

        const signedDto = options.dto.signed(options.privateKey);
        try {
            const payload = JSON.stringify(signedDto);
            const res = await axios({
                method: 'POST',
                url: url.toString(),
                headers: {
                    Authorization: `Bearer ${signedDto.signature}`,
                },
                data: isProd
                    ? payload
                    : {
                          method: 'GalaChainToken:TransferToken',
                          args: [payload],
                      },
            });
            console.log(res);
        } catch (error) {
            logger.error(error.response.data);
            throw new BadRequestError(error.response.data.message);
        }
    }
}
