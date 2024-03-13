import {
  authorizationUrlParameters,
  tokenGrantBody,
} from '@/config/oidcConfig';
import { oidcClient } from '@/lib/Oidc/OidcClient';
import { TokenSet, UnknownObject, UserinfoResponse } from 'openid-client';
import { Inject } from 'typedi';

@Inject()
export class OidcService {
  /**
   * Generates authorization url
   * @return {string}
   */
  public generateAuthorizationUrl(): string {
    const authorizationUrl = oidcClient.authorizationUrl(
      authorizationUrlParameters
    );
    return authorizationUrl;
  }

  /**
   * Authorize and grant access tokens
   * @return {string}
   */
  public async grantAccessTokenByCode(code: string): Promise<TokenSet> {
    const grantParameters = {
      ...tokenGrantBody,
      code,
    };

    const tokenSet = await oidcClient.grant(grantParameters);

    return tokenSet;
  }

  /**
   * Authorize and grant access tokens
   * @return {string}
   */
  public async getUserInfoByTokenSet(
    tokenSet: TokenSet
  ): Promise<UserinfoResponse<UnknownObject, UnknownObject>> {
    const userInfo = await oidcClient.userinfo(tokenSet);

    return userInfo;
  }
}
