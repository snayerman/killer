import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Button } from 'react-bootstrap';
import PlayingCard from './PlayingCard/PlayingCard';

const Styled = {
  Container: styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex: 1;
    align-items: center;
    flex-direction: column;
  `,
  CurrentPlayerContainer: styled.div`
    justify-content: flex-end;
    flex-direction: column;
    display: flex;
    flex: 1;
    padding: 10px;
    margin-bottom: 25px;
  `,
  ButtonsContainer: styled.div`
    display: flex;
    justify-content: space-evenly;
    padding-top: 50px;
  `,
  Button: styled(Button)`
    width: 125px;
    margin: 5px;
  `,
  CurrentPlayerHandContainer: styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
  `,
};

const getPlayerFromGame = (id, game) => {
  const player = game.players.find((player) => {
    return player.id === id;
  });

  return player !== null ? player : null;
};

const Table = ({ data, setters }) => {
  const { connection, player, socket, gameState: game } = data;
  const { updateConnection, updatePlayer, setGameState } = setters;

  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setDimensions({ width, height });
    };
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const disconnect = () => {
    socket.emit('leave_room', { connection, player });

    updateConnection({
      roomId: '',
      joined: false,
    });

    updatePlayer({
      id: null,
      name: '',
    });

    window.sessionStorage.clear();
  };

  const renderCurrentPlayerHand = (player) => {
    // const selectedCards = { player };
    const convertSuit = (suit) => suit.slice(0, 1).toLowerCase();
    const { gameId } = game;

    return (
      <Styled.CurrentPlayerHandContainer>
        {player.hand.map((card) => {
          return (
            <PlayingCard
              key={card.value}
              suit={convertSuit(card.suit)}
              rank={card.rank}
              dimensions={dimensions}
              selected={card.selected}
              onClick={() =>
                socket.emit('click_card', {
                  gameId,
                  playerId: player.id,
                  card,
                })
              }
            />
          );
          // return <div>hi</div>;
        })}
      </Styled.CurrentPlayerHandContainer>
    );
  };

  const renderCurrentPlayerContainer = () => {
    const currentPlayer = getPlayerFromGame(player.id, game);

    return (
      <Styled.CurrentPlayerContainer>
        {currentPlayer && renderCurrentPlayerHand(currentPlayer)}
        <Styled.ButtonsContainer>
          <Styled.Button variant='secondary'>Play</Styled.Button>
          <Styled.Button variant='secondary'>Pass</Styled.Button>
          <Styled.Button variant='secondary' onClick={() => disconnect()}>
            Disconnect
          </Styled.Button>
        </Styled.ButtonsContainer>
      </Styled.CurrentPlayerContainer>
    );
  };

  return (
    <Styled.Container>
      {`Number of players in game: ${game.players.length}`}
      {renderCurrentPlayerContainer()}
    </Styled.Container>
  );
};

export default Table;
