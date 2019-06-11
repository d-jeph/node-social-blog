import axios from 'axios';
import jwt_decode from 'jwt-decode';
import setAuthToken from '../utils/setAuthToken';
import { GET_ERRORS, SET_CURRENT_USER } from './actionTypes';

//REGISTER USER
export const registerUser = (userData, history) => dispatch => {
  axios
    .post('/users/register', userData)
    .then(res => history.push('/login'))
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    );
};

//Login - get user token
export const loginUser = userData => dispatch => {
  axios
    .post('/users/login/', userData)
    .then(res => {
      //destruct token from response
      const { token } = res.data;
      //save token to local storage
      localStorage.setItem('jwtToken', token);
      //set to authheader
      setAuthToken(token);
      //decode token to get userdata
      const decodedTokenData = jwt_decode(token);
      //set current user
      dispatch(setCurrentUser(decodedTokenData));
    })
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    );
};

export const setCurrentUser = decodedTokenData => {
  return {
    type: SET_CURRENT_USER,
    payload: decodedTokenData
  };
};

export const logoutUser = () => dispatch => {
  //remove token from localstorage
  localStorage.removeItem('jwtToken');
  //Remove Auth header
  setAuthToken(false);
  //Set current user to {} which sets isAuthenticated false
  dispatch(setCurrentUser({}));
};
