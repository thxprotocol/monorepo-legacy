type TInteraction = {
    iat: number;
    exp: number;
    session?:
        | {
              accountId: string;
              uid: string;
              cookie: string;
              acr?: string | undefined;
              amr?: string[] | undefined;
          }
        | undefined;
    params: any;
    prompt: object;
    result?: object | undefined;
    returnTo: string;
    deviceCode?: string | undefined;
    trusted?: string[] | undefined;
    uid: string;
    lastSubmission?: object | undefined;
    grantId?: string | undefined;
};
