import React from 'react';
import ReactDOM from 'react-dom';
import socketIOClient from 'socket.io-client';
import './index.css';
import App from './App';

const endpoint = 'localhost:3000';
const socket = socketIOClient(endpoint);

ReactDOM.render(
  <React.StrictMode>
    <App socket={socket} />
  </React.StrictMode>,
  document.getElementById('root')
);
