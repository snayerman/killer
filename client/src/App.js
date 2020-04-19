import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import PlayingCard from './components/PlayingCard/PlayingCard';
import Table from './components/Table';
import Home from './components/Home';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App({ socket }) {
  // const endpoint = 'localhost:3000';
  const defaultPlayer = {
    id: null,
    name: '',
  };
  const defaultConnection = {
    roomId: '',
    joined: false,
  };

  const [connection, updateConnection] = useState(defaultConnection);
  const [player, updatePlayer] = useState(defaultPlayer);
  const [gameState, setGameState] = useState(null);
  const [error, setError] = useState(null);

  const killer = JSON.parse(window.sessionStorage.getItem('killer'));

  useEffect(() => {
    // Attempt to join room if killer sessionStorage token exists
    if (killer) {
      const { connection, player } = killer;
      socket.emit('join_room', { connection, player });
    }

    // Client joins room
    socket.on('room_joined', ({ game, player }) => {
      console.log('room joined: ', { game, player });
      updateConnection({ roomId: game.gameId, joined: true });
      updatePlayer({ id: player.id, name: player.name });
      setGameState(game);
    });

    // Other clients join room
    socket.on('someone_joined_room', (game) => {
      // console.log('someone else joined room: ', game);
      setGameState(game);
    });

    // Update game
    socket.on('update_game', (game) => {
      console.log('updating game state... ', game);
      setGameState(game);
    });

    // Handle errors
    socket.on('error_event', ({ type, message }) => {
      if (type === 'LOCAL_ROOM') window.sessionStorage.clear();
      setError(message);
    });

    return () => {
      console.log('leaving room...');
      socket.emit('leave_room', { connection, player });
    };
  }, []);

  useEffect(() => {
    // Update the sessionStorage token for game
    if (!killer && connection.joined && player.id !== null) {
      window.sessionStorage.setItem(
        'killer',
        JSON.stringify({ connection, player })
      );
    }
  }, [connection, player]);

  const props = {
    data: {
      connection,
      player,
      socket,
      gameState,
    },
    setters: {
      updateConnection,
      updatePlayer,
      setGameState,
    },
  };

  const renderModal = () => {
    return (
      <Modal show={!!error} onHide={() => setError(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Modal heading</Modal.Title>
        </Modal.Header>
        <Modal.Body>{error}</Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setError(null)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  const renderHomePage = () => {
    const { joined } = connection;

    if (!joined && killer) return <p>Joining game...</p>;
    else if (!joined) return <Home {...props} />;
    else return null;
  };

  return (
    <div className='App'>
      <header className='App-header'>
        {renderModal()}
        {connection.joined && gameState && <Table {...props} />}
        {renderHomePage()}

        {/* <div style={{ display: 'flex', flexDirection: 'row' }}>
          <PlayingCard suit='c' rank='9' />
          <PlayingCard suit='d' rank='J' />
          <PlayingCard suit='h' rank='9' />
          <PlayingCard suit='s' rank='9' />
        </div> */}
        {/* <p>{`You've pressed the button ${socketData} times!`}</p>
        <button onClick={() => socket.emit('buttonClick', socketData)}>
          Click
        </button> */}
      </header>
    </div>
  );
}

export default App;
