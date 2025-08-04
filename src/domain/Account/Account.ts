


export class Account {
    userId: string;
    type: string;
    provider: string;
    providerAccountId: string;
    refresh_token: string;
    access_token: string;
    expires_at: number;
    token_type: string;
    scope: string;
    id_token: string;
    session_state: string;

    constructor(
        userId            : string,
        type              : string,
        provider          : string,
        providerAccountId : string,
        refresh_token     : string,
        access_token      : string,
        expires_at        : number,
        token_type        : string,
        scope             : string,
        id_token          : string,
        session_state     : string
    ) {
        this.userId = userId
        this.type = type
        this.provider = provider
        this.providerAccountId = providerAccountId
        this.refresh_token = refresh_token
        this.access_token = access_token
        this.expires_at = expires_at
        this.token_type = token_type
        this.scope = scope
        this.id_token = id_token
        this.session_state = session_state
    }

}