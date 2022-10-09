import { TClaim } from '@thxnetwork/dashboard/store/modules/claims';

export enum RewardState {
  Disabled = 0,
  Enabled = 1,
}

interface Poll {
  id: number;
  startTime: number;
  endTime: number;
  totalVoted: number;
  withdrawAmount: number;
  withdrawDuration: number;
  withdrawUnlockDate: Date;
  yesCounter: number;
  noCounter: number;
}

export interface Reward {
  _id: string;
  id: string;
  expiryDate: Date;
  withdrawLimit: number;
  withdrawAmount: number;
  withdrawDuration: number;
  withdrawUnlockDate: Date;
  state: RewardState;
  poolId: string;
  poll: Poll;
  withdrawCondition: IRewardCondition;
  progress: number;
  isClaimOnce: boolean;
  isMembershipRequired: boolean;
  title: string;
  claims: TClaim[];
  amount: number;
  createdAt: Date;
  updatedAt: Date;
  erc721metadataId: string;
}

export interface IRewards {
  [poolId: string]: { [id: string]: Reward };
}

export enum ChannelType {
  None = 0,
  YouTube = 1,
  Twitter = 2,
}

export enum ChannelAction {
  YouTubeLike = 0,
  YouTubeSubscribe = 1,
  TwitterLike = 2,
  TwitterRetweet = 3,
  TwitterFollow = 4,
}

export const channelList: IChannel[] = [
  {
    type: ChannelType.None,
    name: ChannelType[0],
    logoURI: '',
    actions: [],
  },
  {
    type: ChannelType.YouTube,
    name: ChannelType[1],
    logoURI: require('@thxnetwork/dashboard/../public/assets/logo-youtube.png'),
    actions: [ChannelAction.YouTubeLike, ChannelAction.YouTubeSubscribe],
  },
  {
    type: ChannelType.Twitter,
    name: ChannelType[2],
    logoURI: require('@thxnetwork/dashboard/../public/assets/logo-twitter.png'),
    actions: [
      ChannelAction.TwitterLike,
      ChannelAction.TwitterRetweet,
      ChannelAction.TwitterFollow,
    ],
  },
];
export const channelActionList = [
  {
    type: ChannelAction.YouTubeLike,
    name: 'Like',
    items: [],
  },
  {
    type: ChannelAction.YouTubeSubscribe,
    name: 'Subscribe',
    items: [],
  },
  {
    type: ChannelAction.TwitterLike,
    name: 'Like',
    items: [],
  },
  {
    type: ChannelAction.TwitterRetweet,
    name: 'Retweet',
    items: [],
  },
  {
    type: ChannelAction.TwitterFollow,
    name: 'Follow',
    items: [],
  },
];

export interface IRewardCondition {
  channelType: ChannelType;
  channelAction: ChannelAction;
  channelItem: any;
}

export interface IChannel {
  type: ChannelType;
  name: string;
  logoURI: string;
  actions: ChannelAction[];
}

export interface IChannelAction {
  type: ChannelAction;
  name: string;
  items: any[];
}
