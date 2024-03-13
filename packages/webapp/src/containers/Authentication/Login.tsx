// @ts-nocheck
import { Formik } from 'formik';
import { Link } from 'react-router-dom';

import { FormattedMessage as T, AppToaster as Toaster } from '@/components';
import AuthInsider from '@/containers/Authentication/AuthInsider';
import {
  useAuthLogin,
  useAuthOidcAuthorize,
  useAuthOidcLogin,
} from '@/hooks/query';

import useQueryParams from '@/hooks/useQueryParams';
import { useEffect, useState } from 'react';
import { useAuthMetaBoot } from './AuthMetaBoot';
import LoginForm from './LoginForm';
import {
  AuthFooterLink,
  AuthFooterLinks,
  AuthInsiderCard,
  AuthOidcSignInButton,
} from './_components';
import { LoginSchema, transformLoginErrorsToToasts } from './utils';

const initialValues = {
  crediential: '',
  password: '',
  keepLoggedIn: false,
};

/**
 * Login page.
 */
export default function Login() {
  const query = useQueryParams();

  const codeParam = query.get('code');

  const [oidcCode, setOidcCode] = useState<null | string>(null);

  const { mutateAsync: loginMutate } = useAuthLogin();
  const { isLoading: oidcAuthorizing, mutateAsync: OidcAuthorizeMutate } =
    useAuthOidcAuthorize();
  const { mutateAsync: OIdcLoginMutate } = useAuthOidcLogin();
  const handleSubmit = (values, { setSubmitting }) => {
    loginMutate({
      crediential: values.crediential,
      password: values.password,
    }).catch(
      ({
        response: {
          data: { errors },
        },
      }) => {
        const toastBuilders = transformLoginErrorsToToasts(errors);

        toastBuilders.forEach((builder) => {
          Toaster.show(builder);
        });
        setSubmitting(false);
      },
    );
  };

  const handleOidcAuthorize = () => {
    OidcAuthorizeMutate({}).catch((error) => {});
  };

  const handleOidcLogin = async (code: string) => {
    OIdcLoginMutate({
      code,
    }).catch((error) => {
      setOidcCode(null);
    });
  };

  useEffect(() => {
    if (codeParam && !oidcCode) {
      setOidcCode(codeParam.toString());
      handleOidcLogin(codeParam.toString());
    }
  }, [codeParam]);

  return (
    <AuthInsider>
      <AuthInsiderCard>
        <Formik
          initialValues={initialValues}
          validationSchema={LoginSchema}
          onSubmit={handleSubmit}
          component={LoginForm}
        />
        <AuthOidcSignInButton
          onClick={handleOidcAuthorize}
          type={'button'}
          fill
          large
          loading={oidcAuthorizing}
        >
          <T id={'oidc_log_in'} />
        </AuthOidcSignInButton>
      </AuthInsiderCard>

      <LoginFooterLinks />
    </AuthInsider>
  );
}

function LoginFooterLinks() {
  const { signupDisabled } = useAuthMetaBoot();

  return (
    <AuthFooterLinks>
      {!signupDisabled && (
        <AuthFooterLink>
          Don't have an account? <Link to={'/auth/register'}>Sign up</Link>
        </AuthFooterLink>
      )}
      <AuthFooterLink>
        <Link to={'/auth/send_reset_password'}>
          <T id={'forget_my_password'} />
        </Link>
      </AuthFooterLink>
    </AuthFooterLinks>
  );
}
