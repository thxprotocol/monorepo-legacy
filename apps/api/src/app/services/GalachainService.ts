import { TokenInstanceKey, createValidDTO, TransferTokenDto } from '@gala-chain/api';
import { plainToInstance } from 'class-transformer';
import { BigNumber } from 'bignumber.js';
import { logger } from '../util/logger';
import { BadRequestError } from '../util/errors';
import axios from 'axios';

const GALACHAIN_URL = 'https://gateway.stage.galachain.com/api/';

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
        const signedDto = options.dto.signed(options.privateKey);
        const url = new URL(GALACHAIN_URL);
        url.pathname = `${url.pathname}/${options.contract.channelName}/${options.contract.chaincodeName}`;

        try {
            const res = await axios({
                method: 'POST',
                url: url.toString(),
                headers: {},
                data: signedDto.serialize(),
            });
            console.log(res);
        } catch (error) {
            logger.error(error.response.data);
            throw new BadRequestError(error.response.data.message);
        }
    }
}
