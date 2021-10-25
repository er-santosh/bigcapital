import React from 'react';
import styled from 'styled-components';

import { DataTable, TableFastCell, FormattedMessage as T } from 'components';
import { TABLES } from 'common/tables';

import TableVirtualizedListRows from 'components/Datatable/TableVirtualizedRows';
import TableSkeletonRows from 'components/Datatable/TableSkeletonRows';
import TableSkeletonHeader from 'components/Datatable/TableHeaderSkeleton';

import withSettings from '../../Settings/withSettings';
import withAlertsActions from 'containers/Alert/withAlertActions';
import withDrawerActions from 'containers/Drawer/withDrawerActions';

import { useMemorizedColumnsWidths } from '../../../hooks';
import { useAccountTransactionsColumns, ActionsMenu } from './components';
import { useAccountTransactionsContext } from './AccountTransactionsProvider';
import { compose } from 'utils';

/**
 * Account transactions data table.
 */
function AccountTransactionsDataTable({
  // #withSettings
  cashflowTansactionsTableSize,

  // #withAlertsActions
  openAlert,

  // #withDrawerActions
  openDrawer,
}) {
  // Retrieve table columns.
  const columns = useAccountTransactionsColumns();

  // Retrieve list context.
  const { cashflowTransactions, isCashFlowTransactionsLoading } =
    useAccountTransactionsContext();

  // Local storage memorizing columns widths.
  const [initialColumnsWidths, , handleColumnResizing] =
    useMemorizedColumnsWidths(TABLES.CASHFLOW_Transactions);

  // handle delete transaction
  const handleDeleteTransaction = ({ reference_id }) => {
    openAlert('account-transaction-delete', { referenceId: reference_id });
  };

  const handleViewDetailCashflowTransaction = ({
    reference_id,
    reference_type,
  }) => {
    switch (reference_type) {
      case 'SaleReceipt':
        return openDrawer('receipt-detail-drawer', {
          receiptId: reference_id,
        });
      case 'Journal':
        return openDrawer('journal-drawer', {
          manualJournalId: reference_id,
        });
      case 'Expense':
        return openDrawer('expense-drawer', {
          expenseId: reference_id,
        });
      case 'PaymentReceive':
        return openDrawer('payment-receive-detail-drawer', {
          paymentReceiveId: reference_id,
        });
      case 'BillPayment':
        return openDrawer('payment-made-detail-drawer', {
          paymentMadeId: reference_id,
        });

      default:
        return openDrawer('cashflow-transaction-drawer', {
          referenceId: reference_id,
        });
    }
  };

  return (
    <CashflowTransactionsTable
      noInitialFetch={true}
      columns={columns}
      data={cashflowTransactions}
      sticky={true}
      loading={isCashFlowTransactionsLoading}
      headerLoading={isCashFlowTransactionsLoading}
      expandColumnSpace={1}
      expandToggleColumn={2}
      selectionColumnWidth={45}
      TableCellRenderer={TableFastCell}
      TableLoadingRenderer={TableSkeletonRows}
      TableRowsRenderer={TableVirtualizedListRows}
      TableHeaderSkeletonRenderer={TableSkeletonHeader}
      ContextMenu={ActionsMenu}
      // #TableVirtualizedListRows props.
      vListrowHeight={cashflowTansactionsTableSize == 'small' ? 32 : 40}
      vListOverscanRowCount={0}
      initialColumnsWidths={initialColumnsWidths}
      onColumnResizing={handleColumnResizing}
      noResults={
        <T
          id={
            'cash_flow_there_is_deposit_withdrawal_transactions_on_the_current_account'
          }
        />
      }
      className="table-constrant"
      payload={{
        onViewDetails: handleViewDetailCashflowTransaction,
        onDelete: handleDeleteTransaction,
      }}
    />
  );
}

export default compose(
  withSettings(({ cashflowTransactionsSettings }) => ({
    cashflowTansactionsTableSize: cashflowTransactionsSettings?.tableSize,
  })),
  withAlertsActions,
  withDrawerActions,
)(AccountTransactionsDataTable);

const DashboardConstrantTable = styled(DataTable)`
  .table {
    .thead {
      .th {
        background: #fff;
      }
    }

    .tbody {
      .tr:last-child .td {
        border-bottom: 0;
      }
    }
  }
`;

const CashflowTransactionsTable = styled(DashboardConstrantTable)`
  .table .tbody {
    .tbody-inner .tr.no-results {
      .td {
        padding: 2rem 0;
        font-size: 14px;
        color: #888;
        font-weight: 400;
        border-bottom: 0;
      }
    }

    .tbody-inner {
      .tr .td:not(:first-child) {
        border-left: 1px solid #e6e6e6;
      }
    }
  }
`;

const DashboardRegularTable = styled(DataTable)``;
