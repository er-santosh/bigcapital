import ApiService from 'services/ApiService';
import t from 'store/types';

export const makeJournalEntries = ({ form }) => {
  return (dispatch) => new Promise((resolve, reject) => {
    ApiService.post('accounting/make-journal-entries', form).then((response) => {
      resolve(response);
    }).catch((error) => { reject(error); });
  });
};

export const fetchManualJournal = ({ id }) => {
  return (dispatch) => new Promise((resolve, reject) => {
    ApiService.get(`accounting/manual-journals/${id}`).then((response) => {
      dispatch({
        type: t.MANUAL_JOURNAL_SET,
        payload: {
          id,
          manualJournal: response.data.manual_journal,
        }, 
      });
      resolve(response);
    }).catch((error) => { reject(error); });
  });
};

export const editManualJournal = ({ form, id }) => {
  return (dispatch) => new Promise((resolve, reject) => {
    ApiService.post(`accounting/manual-journals/${id}`, form).then((response) => {
      resolve(response);
    }).catch((error) => { reject(error); });
  });
};

export const deleteManualJournal = ({ id }) => {
  return (dispatch) =>
    new Promise((resolve, reject) => {
      ApiService.delete(`accounting/manual-journals/${id}`)
        .then((response) => {
          dispatch({
            type: t.MANUAL_JOURNAL_REMOVE,
            payload: { id },
          });
          resolve(response);
        })
        .catch((error) => { reject(error); });
    });
};

export const publishManualJournal = ({ id }) => {
  return (dispatch) =>
    new Promise((resolve, reject) => {
      ApiService.post(`accounting/manual-journals/${id}/publish`)
        .then((response) => {
          dispatch({
            type: t.MANUAL_JOURNAL_PUBLISH,
            payload: { id },
          });
          resolve(response);
        })
        .catch((error) => { reject(error); });
    });
}

export const fetchManualJournalsTable = ({ query } = {}) => {
  return (dispatch, getState) =>
    new Promise((resolve, reject) => {
      const pageQuery = getState().manualJournals.tableQuery;
      dispatch({
        type: t.MANUAL_JOURNALS_TABLE_LOADING,
        loading: true,
      });
      ApiService.get('accounting/manual-journals', {
        params: { ...pageQuery, ...query },
      })
        .then((response) => {
          
          dispatch({
            type: t.MANUAL_JOURNALS_PAGE_SET,
            manual_journals: response.data.manualJournals,
            customViewId: response.data.customViewId,
          });
          dispatch({
            type: t.MANUAL_JOURNALS_ITEMS_SET,
            manual_journals: response.data.manualJournals,
          });
          dispatch({
            type: t.MANUAL_JOURNALS_TABLE_LOADING,
            loading: false,
          });
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
};