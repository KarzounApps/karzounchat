import APIHelper from '../helpers/APIHelper';
import axios from 'axios';
// import * as Sentry from '@sentry/react-native';
import {
  LOGIN,
  LOGIN_ERROR,
  LOGIN_SUCCESS,
  USER_LOGOUT,
  SET_AUTH_HEADER,
  RESET_PASSWORD,
  RESET_PASSWORD_SUCCESS,
  RESET_PASSWORD_ERROR,
  RESET_AUTH,
  SET_LOCALE,
  SET_ACCOUNT,
  UPDATE_USER,
  UPDATE_ACTIVITY_STATUS,
  UPDATE_ACTIVITY_STATUS_SUCCESS,
  UPDATE_ACTIVITY_STATUS_ERROR,
} from '../constants/actions';
import { showToast } from '../helpers/ToastHelper';
import I18n from '../i18n';
import { getHeaders } from '../helpers/AuthHelper';
import { getBaseUrl } from '../helpers/UrlHelper';
import { API_URL } from '../constants/url';
// import { identifyUser, resetAnalytics } from '../helpers/Analytics';
import { clearDeviceDetails } from './notification';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const doLogin =
  ({ email, password }) =>
    async dispatch => {
      try {

        dispatch({ type: LOGIN });
        const response = await APIHelper.post('auth/sign_in', { email, password });
        const { data } = response.data;
        const { name: username, id, account_id } = data;


        let deleteAccount = await axios.get("https://camp-coding.org/Karzoun/open_delete_account.php")
        let res = deleteAccount.data
        let deleteAccountLocally = await AsyncStorage.getItem("delecte_account");
        let deletedEmail = await AsyncStorage.getItem("email");
        await AsyncStorage.setItem("delete_account_from_server",res+"");

        console.log("res " + res)
        console.log("locale " + deleteAccountLocally)

        /// here we simulate account deletion
        if (deleteAccountLocally == 1 && res == 1) {

          if (email == deletedEmail) {
            dispatch({ type: LOGIN_ERROR, payload: response });

            showToast({ message: I18n.t('ERRORS.AUTH') });

          } else {
            checkUserAccount(account_id, email, username, id, response, data, dispatch)
          }

        } else {
          checkUserAccount(account_id, email, username, id, response, data, dispatch)

        }





      } catch ({ response }) {
        dispatch({ type: LOGIN_ERROR, payload: response });
        if (response && response.status === 401) {
          const { errors } = response.data;

          const hasAuthErrorMsg =
            errors && errors.length && errors[0] && typeof errors[0] === 'string';
          if (hasAuthErrorMsg) {
            showToast({ message: errors[0] });
          } else {
            showToast({ message: I18n.t('ERRORS.AUTH') });
          }
          return;
        }
        showToast({ message: I18n.t('ERRORS.COMMON_ERROR') });
      }
    };

const checkUserAccount = (account_id, email, username, id, response, data, dispatch) => {
  // Check user has any account
  if (account_id) {
    // Sentry.setUser({ email, username, id });
    // identifyUser({ userId: id, email, name: username });
    dispatch({ type: SET_AUTH_HEADER, payload: response.headers });
    dispatch({ type: LOGIN_SUCCESS, payload: data });
  } else {
    showToast({ message: I18n.t('ERRORS.NO_ACCOUNTS_MESSAGE') });
    dispatch({ type: LOGIN_ERROR, payload: '' });
  }
}

export const onResetPassword =
  ({ email }) =>
    async dispatch => {
      try {
        dispatch({ type: RESET_PASSWORD });
        const response = await APIHelper.post('auth/password', { email });
        let successMessage = I18n.t('FORGOT_PASSWORD.API_SUCCESS');
        if (response.data && response.data.message) {
          successMessage = response.data.message;
        }
        showToast({ message: successMessage });
        const { data } = response;
        dispatch({ type: RESET_PASSWORD_SUCCESS, payload: data });
      } catch (error) {
        let errorMessage = I18n.t('ERRORS.AUTH');
        if (error?.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        showToast({ message: errorMessage });
        dispatch({ type: RESET_PASSWORD_ERROR, payload: error });
      }
    };

export const getAccountDetails = () => async dispatch => {
  try {
    const result = await APIHelper.get('');

    const {
      data: { locale },
    } = result;
    dispatch({ type: SET_LOCALE, payload: locale || 'en' });
  } catch (error) { }
};

export const resetAuth = () => async dispatch => {
  dispatch({ type: RESET_AUTH });
};

export const onLogOut = () => async (dispatch, getState) => {
  const { pushToken } = await getState().notification;
  dispatch(clearDeviceDetails({ pushToken }));
  // resetAnalytics();
  dispatch({ type: SET_LOCALE, payload: 'en' });
  dispatch({ type: USER_LOGOUT });
};

export const setAccount =
  ({ accountId }) =>
    async dispatch => {
      dispatch({ type: SET_ACCOUNT, payload: accountId });
    };
// Add/Update availability status of agents
export const addOrUpdateActiveUsers =
  ({ users }) =>
    async (dispatch, getState) => {
      const { user: loggedUser } = await getState().auth;
      if (loggedUser) {
        Object.keys(users).forEach(user => {
          if (parseInt(user) === loggedUser.id) {
            loggedUser.availability_status = users[user];
            dispatch({
              type: UPDATE_USER,
              payload: loggedUser,
            });
          }
        });
      }
    };

export const updateAvailabilityStatus =
  ({ availability }) =>
    async dispatch => {
      dispatch({ type: UPDATE_ACTIVITY_STATUS });
      try {
        const headers = await getHeaders();
        const baseUrl = await getBaseUrl();
        const { accountId } = headers;
        const data = { profile: { availability, account_id: accountId } };
        await axios.post(`${baseUrl}${API_URL}profile/availability`, data, {
          headers: headers,
        });
        dispatch({
          type: UPDATE_ACTIVITY_STATUS_SUCCESS,
          payload: availability,
        });
      } catch (error) {
        dispatch({ type: UPDATE_ACTIVITY_STATUS_ERROR, payload: error });
      }
    };
