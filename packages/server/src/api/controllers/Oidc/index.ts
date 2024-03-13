import BaseController from '@/api/controllers/BaseController';
import { oidcClient } from '@/lib/Oidc/OidcClient';
import { OidcService } from '@/services/Oidc';
import { NextFunction, Request, Response, Router } from 'express';
import { Inject, Service } from 'typedi';

@Service()
export default class OidcController extends BaseController {
  @Inject()
  private oidcService: OidcService;

  /**
   * Router constructor method.
   */
  public router() {
    const router = Router();

    router.post('/authorize', this.authorize);

    router.post('/login', this.oidcLogin);

    router.post('/logout', this.oidcLogout);

    return router;
  }

  /**
   * Authentication Oidc authorize.
   * @param {Request} req -
   * @param {Response} res -
   * @param {NextFunction} next -
   */
  private authorize = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const authorizationUrl = this.oidcService.generateAuthorizationUrl();

      res.json({ authorizationUrl });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Authentication oidc login.
   * @param {Request} req -
   * @param {Response} res -
   * @param {NextFunction} next -
   */
  private oidcLogin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const code = req.body.code;

      const tokenSet = await this.oidcService.grantAccessTokenByCode(code);

      const userInfo = await this.oidcService.getUserInfoByTokenSet(tokenSet);

      console.log({ userInfo });

      return res.status(200).send({
        token: tokenSet.access_token,
        user: '',
        tenant: '',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Authentication oidc logout.
   * @param {Request} req -
   * @param {Response} res -
   * @param {NextFunction} next -
   */
  private oidcLogout = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const loggedOut = oidcClient.endSessionUrl();

      console.log({ loggedOut });

      return res.status(200).send({});
    } catch (error) {
      next(error);
    }
  };
}
