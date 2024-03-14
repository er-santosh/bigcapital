import config from '@/config';
import { ISystemUser } from '@/interfaces';
import JWT from 'jsonwebtoken';

interface IExtendedSystemUser extends ISystemUser {
  open_id_token: string;
}

/**
 * Generates JWT token for the given user.
 * @param {ISystemUser} user
 * @return {string} token
 */
export const generateToken = (user: IExtendedSystemUser): string => {
  const today = new Date();
  const exp = new Date(today);
  exp.setDate(today.getDate() + 60);

  return JWT.sign(
    {
      id: user.id, // We are gonna use this in the middleware 'isAuth'
      exp: exp.getTime() / 1000,
      open_id_token: user.open_id_token,
    },
    config.jwtSecret
  );
};
