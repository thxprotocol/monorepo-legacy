import { TokenInstanceKey, createValidDTO, TransferTokenDto } from '@gala-chain/api';
import { plainToInstance } from 'class-transformer';
import { BigNumber } from 'bignumber.js';
import axios from 'axios';

// const GALACHAIN_URL = 'https://gateway.stage.galachain.com/api/hackathonXX';
const GALACHAIN_URL = 'http://localhost:8801/invoke';

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
        url.pathname = `${options.contract.channelName}/${options.contract.chaincodeName}`;
        console.log(url.toString(), {
            method: 'GalaChainToken:TransferToken',
            args: [JSON.stringify(options.dto.signed(options.privateKey))],
        });

        const res = await axios({
            method: 'POST',
            url: url.toString(),
            data: {
                method: 'GalaChainToken:TransferToken',
                args: [JSON.stringify(options.dto.signed(options.privateKey))],
            },
        });
        console.log(res);
    }
}
