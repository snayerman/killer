import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { getSuitColor, getFullSuitName } from '../../helpers';
import Henry from '../../images/Henry.js';
import Suit from './Suit';

const maxCardsInHand = 13;
const widthToHeightRatio = 2.5 / 3.5;
const paddingSize = 2;
const defaultScreenWidth = window.screen.availWidth;
const defaultCardWidth = Math.ceil(
  defaultScreenWidth / maxCardsInHand - paddingSize * maxCardsInHand,
  100
);
const defaultCardHeight = defaultCardWidth / widthToHeightRatio;
const defaultSuitSize = 45;

const cardWToScreenWRatio = defaultCardWidth / defaultScreenWidth;
const suitToScreenWRation = defaultSuitSize / defaultScreenWidth;

const BREAKPOINT = 1350;

const calcCardWidth = (screenWidth) => screenWidth * cardWToScreenWRatio;
const calcCardHeight = (cardWidth) => cardWidth / widthToHeightRatio;

const colorMap = {
  red: '#b44b41',
  black: '#000000',
};

const Styled = {
  Card: styled.div`
    border-width: 3px;
    border-style: solid;
    border-radius: 5px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    font-size: 1.2em;
    border-color: black;
    -webkit-box-shadow: 3px 3px 4px 0px rgba(0, 0, 0, 0.75);
    -moz-box-shadow: 3px 3px 4px 0px rgba(0, 0, 0, 0.75);
    box-shadow: 3px 3px 4px 0px rgba(0, 0, 0, 0.75);

    color: ${({ color }) => colorMap[color]};
    background-color: ${({ faceUp }) =>
      faceUp ? 'rgba(222, 222, 222, 0.1)' : 'rgba(222, 222, 222, 0.6)'};

    ${({ width, selected }) => {
      const cardWidth = calcCardWidth(width);

      return css`
        width: ${`${cardWidth}px`};
        height: ${`${calcCardHeight(cardWidth)}px`};
        margin-bottom: ${selected ? '50px' : '0px'};
      `;
    }};
  `,
  CardDetails: styled.div`
    padding: 1px;
    display: flex;
    line-height: 1;

    flex-direction: ${({ top }) => (top ? 'column' : 'column-reverse')};
    align-self: ${({ top }) => (top ? 'flex-start' : 'flex-end')};
  `,
  BigSuit: styled.div`
    position: relative;
  `,
  RankText: styled.p`
    margin: 0 auto;
    font-size: ${({ size }) => `${size}px`};
  `,
  SmallCard: styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    line-height: 1;

    p {
      font-weight: 700;
      font-size: 1.4rem;
    }
  `,
};

const PlayingCard = (props) => {
  const { suit, rank, faceUp, dimensions, selected, onClick } = props;
  const suitName = getFullSuitName(suit);
  const color = getSuitColor(suitName);

  const renderDetails = (size, suit, rank, screenWidth) => {
    const bigSuitSize = screenWidth * suitToScreenWRation;

    if (screenWidth < BREAKPOINT) {
      return (
        <Styled.SmallCard>
          <Styled.RankText size={size}>{rank}</Styled.RankText>
          <Styled.BigSuit>
            <Suit size={bigSuitSize} suit={suitName} color={colorMap[color]} />
          </Styled.BigSuit>
        </Styled.SmallCard>
      );
    } else {
      // 0 - top details, 1 - big suit center, 2 - bottom details
      return [0, 1, 2].map((idx) => {
        const top = idx === 0;

        return idx !== 1 ? (
          <Styled.CardDetails key={idx} top={top}>
            <Styled.RankText size={size}>{rank}</Styled.RankText>
            <Suit size={size} suit={suit} color={colorMap[color]} />
          </Styled.CardDetails>
        ) : (
          <Styled.BigSuit key={idx}>
            <Suit size={bigSuitSize} suit={suitName} color={colorMap[color]} />
          </Styled.BigSuit>
        );
      });
    }
  };

  return (
    <Styled.Card
      color={color}
      faceUp={faceUp}
      width={dimensions.width}
      selected={selected}
      onClick={onClick}
    >
      {faceUp && renderDetails('17', suitName, rank, dimensions.width)}
      {!faceUp && <Henry />}
    </Styled.Card>
  );
};

PlayingCard.defaultProps = {
  faceUp: true,
};

export default PlayingCard;
