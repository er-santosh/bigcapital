import BaseController from '@/api/controllers/BaseController';
import {
  authorizationUrlParameters,
  tokenGrantBody,
} from '@/config/oidcConfig';
import { oidcClient } from '@/lib/Oidc/OidcClient';
import { NextFunction, Request, Response, Router } from 'express';
import { Service } from 'typedi';

@Service()
export default class OidcController extends BaseController {
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
      const authorizationUrl = oidcClient.authorizationUrl(
        authorizationUrlParameters
      );

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

      const grantParameters = {
        ...tokenGrantBody,
        code,
      };

      const tokenSet = await oidcClient.grant(grantParameters);

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
