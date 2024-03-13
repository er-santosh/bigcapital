import {
  authorizationUrlParameters,
  tokenGrantBody,
} from '@/config/oidcConfig';
import { ISystemUser, ITenant } from '@/interfaces';
import { oidcClient } from '@/lib/Oidc/OidcClient';
import TenantsManagerService from '@/services/Tenancy/TenantsManager';
import { Tenant } from '@/system/models';
import { cloneDeep } from 'lodash';
import moment from 'moment';
import { TokenSet, UnknownObject, UserinfoResponse } from 'openid-client';
import { Inject } from 'typedi';

interface IOidcLoginResponse {
  token: string;
  user: ISystemUser;
  tenant: ITenant;
}

@Inject()
export class OidcService {
  @Inject('repositories')
  private sysRepositories: any;

  @Inject()
  private tenantsManager: TenantsManagerService;

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
   * @param {string} code
   * @return {Promise<TokenSet>}
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
   * @param {string} accessToken
   * @return {Promise<UserinfoResponse<UnknownObject, UnknownObject>>}
   */
  public async getUserInfoByAccessToken(
    accessToken: string
  ): Promise<UserinfoResponse<UnknownObject, UnknownObject>> {
    const userInfo = await oidcClient.userinfo(accessToken);

    return userInfo;
  }

  /**
   * Login or create a user
   * @param {string} code
   * @return {Promise<IOidcLoginResponse>}
   */
  public async loginUser(code: string): Promise<IOidcLoginResponse> {
    const tokenSet = await this.grantAccessTokenByCode(code);

    const accessToken = tokenSet.access_token;

    const userInfo = await this.getUserInfoByAccessToken(accessToken);

    const { systemUserRepository } = this.sysRepositories;

    const systemUser = await systemUserRepository.findOneByEmail(
      userInfo.email
    );

    if (!systemUser) {
      const tenant = await this.tenantsManager.createTenant();

      const signupDTO = {
        firstName: userInfo.given_name,
        lastName: userInfo.family_name,
        email: userInfo.email,
      };

      const registeredUser = await systemUserRepository.create({
        ...signupDTO,
        active: true,
        tenantId: tenant.id,
        inviteAcceptedAt: moment().format('YYYY-MM-DD'),
      });

      return {
        token: accessToken,
        user: registeredUser,
        tenant,
      };
    }

    // Update the last login at of the user.
    await systemUserRepository.patchLastLoginAt(systemUser.id);

    const tenant = await Tenant.query()
      .findById(systemUser.tenantId)
      .withGraphFetched('metadata');

    // Keep the user object immutable.
    const outputUser = cloneDeep(systemUser);

    // Remove password property from user object.
    Reflect.deleteProperty(outputUser, 'password');

    return {
      token: accessToken,
      user: outputUser,
      tenant,
    };
  }

  /**
   * Logout oidc user
   * @param {string} accessToken
   * @return {string}
   */
  public generateEndSessionUrl(accessToken: string): string {
    const loggedOutUrl = oidcClient.endSessionUrl({
      id_token_hint: accessToken,
    });

    return loggedOutUrl;
  }
}
