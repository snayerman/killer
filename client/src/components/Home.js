import React from 'react';
import styled from 'styled-components';
import { Form, Button } from 'react-bootstrap';

const Styled = {
  Container: styled.div`
    width: 250px;
    height: 100%;
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  `,
};

const Home = ({ data, setters }) => {
  const { connection, player, socket, gameState } = data;
  const { updateConnection, updatePlayer, setGameState } = setters;

  const joinGame = () => {
    socket.emit('join_room', { connection, player });
  };

  const createGame = () => {
    socket.emit('create_game', { connection, player });
  };

  const renderButtons = () => {
    return (
      <>
        <Button
          variant='primary'
          type='submit'
          block
          onClick={() => joinGame()}
        >
          Join Game
        </Button>

        <Button
          variant='success'
          type='submit'
          block
          onClick={() => createGame()}
        >
          Create Game
        </Button>
      </>
    );
  };

  return (
    <Styled.Container>
      <Form style={{ width: '250px' }}>
        <Form.Group controlId='formBasicEmail'>
          <Form.Label>Name</Form.Label>
          <Form.Control
            as='input'
            placeholder='Enter display name'
            onChange={(e) => {
              updatePlayer({ ...player, name: e.target.value });
            }}
            autoComplete='off'
          />
        </Form.Group>

        <Form.Group controlId='formBasicPassword'>
          <Form.Label>Room Code</Form.Label>
          <Form.Control
            as='input'
            placeholder='Enter room code'
            onChange={(e) => {
              updateConnection({ ...connection, roomId: e.target.value });
            }}
            autoComplete='off'
          />
        </Form.Group>
      </Form>

      {renderButtons()}
    </Styled.Container>
  );
};

export default Home;
