export interface AuthCredentialsRequestBody {
    email: string;
    password: string;
}
export interface AuthenticatedAccountResponseBody {
    id: string;
    email: string;
    isAdmin: boolean;
    createdAt: string;
    updatedAt: string;
    player: {
        id: string;
        displayName: string;
    } | null;
}
export interface AuthSessionResponseBody {
    accessToken: string;
    account: AuthenticatedAccountResponseBody;
}
export interface AuthMeResponseBody {
    account: AuthenticatedAccountResponseBody;
}
