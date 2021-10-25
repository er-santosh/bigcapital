import React from 'react';
import styled from 'styled-components';
import { Classes } from '@blueprintjs/core';
import clsx from 'classnames';
import Icon from '../Icon';

const BankAccountWrap = styled.div`
  width: 225px;
  height: 180px;
  display: flex;
  flex-direction: column;
  border-radius: 3px;
  background: #fff;
  margin: 8px;
  border: 1px solid #c8cad0;
  transition: all 0.1s ease-in-out;

  &:hover {
    border-color: #0153cc;
  }
`;

const BankAccountHeader = styled.div`
  padding: 10px 12px;
  padding-top: 16px;
  position: relative;
`;

const BankAccountTitle = styled.div`
  font-size: 15px;
  font-style: inherit;
  letter-spacing: -0.003em;
  color: rgb(23, 43, 77);
  white-space: nowrap;
  font-weight: 600;
  line-height: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0px;
`;

const BnakAccountCode = styled.div`
  font-size: 11px;
  margin-top: 4px;
  color: rgb(23, 43, 77);
  display: inline-block;
`;

const BankAccountBalanceWrap = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: auto;
  border-top: 1px solid #dfdfdf;
  padding: 10px 12px;
`;

const BankAccountBalanceAmount = styled.div`
  font-size: 16px;
  font-weight: 600;
  line-height: 1;
  color: #57657e;
`;

const BankAccountBalanceLabel = styled.div`
  text-transform: uppercase;
  font-size: 10px;
  letter-spacing: 0.5px;
  margin-top: 3px;
  opacity: 0.6;
`;

const MetaLineWrap = styled.div`
  font-size: 11px;
  display: flex;
  color: #2f3c58;

  &:not(:first-of-type) {
    margin-top: 6px;
  }
`;
const MetaLineTitle = styled.div``;

const MetaLineValue = styled.div`
  box-sizing: border-box;
  font-style: inherit;
  background: rgb(223, 225, 230);
  line-height: initial;
  align-content: center;
  padding: 0px 2px;
  border-radius: 9.6px;
  font-weight: normal;
  text-transform: none;
  margin-left: auto;
  width: 30px;
  min-width: 30px;
  height: 16px;
  text-align: center;
  color: rgb(23, 43, 77);
  font-size: 11px;
`;

const BankAccountMeta = styled.div`
  padding: 0 12px 10px;
`;

export const BankAccountsList = styled.div`
  display: flex;
  margin: -8px;
`;

const AccountIconWrap = styled.div`
  position: absolute;
  top: 14px;
  right: 12px;
  color: #abb3bb;
`;

function BankAccountMetaLine({ title, value, className }) {
  return (
    <MetaLineWrap className={className}>
      <MetaLineTitle>{title}</MetaLineTitle>
      {value && <MetaLineValue>{value}</MetaLineValue>}
    </MetaLineWrap>
  );
}

function BankAccountBalance({ amount, loading }) {
  return (
    <BankAccountBalanceWrap>
      <BankAccountBalanceAmount
        className={clsx({
          [Classes.SKELETON]: loading,
        })}
      >
        {amount}
      </BankAccountBalanceAmount>
      <BankAccountBalanceLabel>Balance</BankAccountBalanceLabel>
    </BankAccountBalanceWrap>
  );
}

const ACCOUNT_TYPE = {
  CASH: 'cash',
  BANK: 'bank',
  CREDIT_CARD: 'credit-card',
};

const ACCOUNT_TYPE_PAIR_ICON = {
  [ACCOUNT_TYPE.CASH]: 'payments',
  [ACCOUNT_TYPE.CREDIT_CARD]: 'credit-card',
  [ACCOUNT_TYPE.BANK]: 'account-balance',
};

function BankAccountTypeIcon({ type }) {
  const icon = ACCOUNT_TYPE_PAIR_ICON[type];

  if (!icon) {
    return;
  }
  return (
    <AccountIconWrap>
      <Icon icon={icon} iconSize={18} />
    </AccountIconWrap>
  );
}

export function BankAccount({
  title,
  code,
  type,
  balance,
  loading = false,
  updatedBeforeText,
  ...restProps
}) {
  return (
    <BankAccountWrap {...restProps}>
      <BankAccountHeader>
        <BankAccountTitle className={clsx({ [Classes.SKELETON]: loading })}>
          {title}
        </BankAccountTitle>
        <BnakAccountCode className={clsx({ [Classes.SKELETON]: loading })}>
          {code}
        </BnakAccountCode>
        {!loading && <BankAccountTypeIcon type={type} />}
      </BankAccountHeader>

      <BankAccountMeta>
        <BankAccountMetaLine
          title={'Account transactions'}
          value={2}
          className={clsx({ [Classes.SKELETON]: loading })}
        />
        <BankAccountMetaLine
          title={updatedBeforeText}
          className={clsx({ [Classes.SKELETON]: loading })}
        />
      </BankAccountMeta>

      <BankAccountBalance amount={balance} loading={loading} />
    </BankAccountWrap>
  );
}