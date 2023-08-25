import React, { useEffect, useReducer, useState } from "react";
import axios from "axios";

// Khởi tạo trạng thái ban đầu của trò chơi
const initialState = {
  players: [
    { name: "Player A", coins: 5000, points: 0, point: 0, cards: [] },
    { name: "Player B", coins: 5000, points: 0, point: 0, cards: [] },
    { name: "Player C", coins: 5000, points: 0, point: 0, cards: [] },
    { name: "Player D", coins: 5000, points: 0, point: 0, cards: [] },
  ],
  deckId: null,
  deckCardRemaining: null,
  shuffle: false,
  drawn: false,
  gameOver: false,
};

// Reducer để quản lý trạng thái trò chơi
const gameReducer = (state: any, action: { type: any; payload?: any }) => {
  switch (action.type) {
    case "SET_DECK_ID":
      // Khởi tạo deckId và deckCard
      return {
        ...state,
        deckId: action.payload.deck_id,
        deckCardRemaining: action.payload.remaining,
      };
    case "SHUFFLE_CARDS":
      // Xử lý trộn bài
      return {
        ...state,
        deckId: action.payload.deck_id,
        deckCardRemaining: action.payload.remaining,
      };
    case "DRAW_CARDS":
      // Xử lý chia bai
      const updatedPlayersCards = state?.players.map(
        (player: any, index: any) => {
          // Chia bài (3 lá) cho mỗi người chơi từ các lá bài đã lấy
          const playerCards = action.payload.cards.slice(
            index * 3,
            (index + 1) * 3
          );
          return {
            ...player,
            cards: playerCards,
          };
        }
      );
      return {
        ...state,
        drawn: true,
        players: updatedPlayersCards,
        deckCardRemaining: action.payload.remaining,
        cards: action.payload.cards,
      };
    case "REVEAL_CARDS":
      // Xử lý việc tính điểm và xác định người thắng
      const updatedPlayerPoint = state?.players?.map((player: any) => {
        // Get player from playerList
        const value: any = player.cards.map((cardList: any) => {
          // Get card from player obj and trans then parse to int
          if (cardList.value === "ACE") return 1;
          if (
            cardList.value === "JACK" ||
            cardList.value === "QUEEN" ||
            cardList.value === "KING"
          )
            return 10;
          return parseInt(cardList.value);
        });
        // Sum of cardList (point of 3 card)
        const parseValue: any = value.reduce((prev: any, currentCard: any) => {
          return prev + currentCard;
        }, 0);
        return {
          ...player,
          points: parseValue,
          point: parseValue % 10,
        };
      });
      console.log("player point:", { updatedPlayerPoint });

      return { ...state, players: updatedPlayerPoint, gameOver: true };
    case "RESET_GAME":
      // Reset cards per player
      return {
        ...initialState,
        deckId: action.payload.deck_id,
        deckCardRemaining: action.payload.remaining,
        shuffle: action.payload.shuffed,
      };
    default:
      return state;
  }
};

const App = () => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const [isShuffling, setIsShuffling] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);

  const [numberOfPlayer, setNumberOfPlayer] = useState(4);

  const shuffleDeck = () => {
    setIsShuffling(true);
    setTimeout(() => {
      setIsShuffling(false);
    }, 300);
    //Trộn bài
    axios
      .get(
        `https://deckofcardsapi.com/api/deck/${state.deckId}/shuffle/?remaining=true`
      )
      .then((res) => {
        dispatch({
          type: "SHUFFLE_CARDS",
          payload: res.data,
        });
        console.log("Shuffle cards: ", res.data);
      })
      .catch((error) => {
        console.error("Error shuffling deck:", error);
      });
  };

  const drawCards = (player: any) => {
    setIsDrawing(true);
    setTimeout(() => {
      setIsDrawing(false);
    }, 600);
    // Chia bài
    axios
      .get(
        `https://deckofcardsapi.com/api/deck/${state.deckId}/draw/?count=${
          player * 3
        }`
      )
      .then((res) => {
        dispatch({
          type: "DRAW_CARDS",
          payload: res.data,
        });
        console.log("DRAW_CARDs: ", res.data);
      })
      .catch((error) => {
        console.error("Error drawing cards:", error);
      });
  };

  const revealCards = () => {
    setIsRevealing(true);
    setTimeout(() => {
      setIsRevealing(false);
    }, 600);
    // Trả kết quả
    dispatch({
      type: "REVEAL_CARDS",
    });
  };

  const resetGame = () => {
    axios
      .get(`https://deckofcardsapi.com/api/deck/new/`)
      .then((res) => {
        dispatch({
          type: "RESET_GAME",
          payload: res.data,
        });
      })
      .catch((error) => {
        console.error("Error shuffling deck:", error);
      });
  };
  console.log({ state });

  useEffect(() => {
    // Lấy một bộ bài mới từ API và lưu deckId vào trạng thái
    axios
      .get("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1")
      .then((res) => {
        dispatch({
          type: "SET_DECK_ID",
          payload: res.data,
        });
        console.log("Start!");
      })
      .catch((error) => {
        console.error("Error fetching deck:", error);
      });
  }, []);

  return (
    <div id="view_player">
      <div className="group-view border">
        <div className="cards">
          {state?.players?.[3].cards.map((img: any, i: number) => {
            return (
              <div key={i}>
                <img className="card-item" src={img.image} alt="cards" />
              </div>
            );
          })}
        </div>
        <div className="user-info">
          <p>Point: {state?.players?.[3].point} </p>
          {/* <p>coins: {state?.players?.[3].coins}</p> */}
          <p>
            <b style={{ fontSize: "22px" }}>{state?.players?.[3].name}</b>
          </p>
          <p>Point of 3 cards: {state?.players?.[3].points}</p>
        </div>
      </div>
      <div className="group">
        <div
          className="border border-radius border-side deckcard"
          style={{ backgroundColor: "#5F3994" }}
        >
          {state?.deckCardRemaining === 52
            ? "Deck Card: "
            : "Deck Card Remaining: "}
          {state?.deckCardRemaining}
        </div>
        <div className="groupbutton">
          <button
            className="border border-btn"
            style={{ backgroundColor: "#377D22" }}
            type="button"
            disabled={isShuffling}
            onClick={shuffleDeck}
          >
            {isShuffling ? "Shuffling..." : "Shuffle"}
          </button>
          <button
            className="border border-btn"
            style={{ backgroundColor: "#EBB844" }}
            type="button"
            disabled={isDrawing}
            onClick={() => {
              drawCards(numberOfPlayer);
            }}
          >
            {isDrawing ? "Drawing..." : "Draw"}
          </button>
          <button
            className="border border-btn"
            style={{ backgroundColor: "#272727" }}
            type="button"
            disabled={isRevealing}
            onClick={revealCards}
          >
            {isRevealing ? "Revealing..." : "Reveal"}
          </button>
        </div>
        <button
          className="border border-btn btn-reset"
          type="button"
          onClick={() => {
            console.log("reset game!");
            resetGame();
          }}
        >
          Reset
        </button>
      </div>
      <div className="group-other-player">
        <div className="other-player-top other-player border">
          {!state.gameOver ? (
            <div className="name-player">{state?.players?.[0].name}</div>
          ) : (
            <div className="player-other">
              <p>Point: {state?.players?.[0].point} </p>
              <p>
                <b>{state?.players?.[0].name}</b>
              </p>
              <p>Point of 3 cards: {state?.players?.[0].points}</p>
            </div>
          )}
          <div className="img-cards">
            {state?.players?.[0].cards.map((image: any, i: number) => {
              return (
                <div key={i} className="item-card">
                  <img src={image.image} alt="cards" />
                </div>
              );
            })}
          </div>
        </div>
        <div className="other-player-left other-player border">
          {!state.gameOver ? (
            <div className="name-player">{state?.players?.[1].name}</div>
          ) : (
            <div className="player-other">
              <p>Point: {state?.players?.[1].point} </p>
              <p>
                <b>{state?.players?.[1].name}</b>
              </p>
              <p>Point of 3 cards: {state?.players?.[1].points}</p>
            </div>
          )}
          <div className="img-cards">
            {state?.players?.[1].cards?.map((image: any, i: number) => {
              return (
                <div key={i} className="item-card">
                  <img src={image.image} alt="cards" />
                </div>
              );
            })}
          </div>
        </div>
        <div className="other-player-right other-player border">
          {!state.gameOver ? (
            <div className="name-player">{state?.players?.[2].name}</div>
          ) : (
            <div className="player-other">
              <p>Point: {state?.players?.[2].point} </p>
              <p>
                <b>{state?.players?.[2].name}</b>
              </p>
              <p>Point of 3 cards: {state?.players?.[2].points}</p>
            </div>
          )}
          <div className="img-cards">
            {state?.players?.[2].cards?.map((image: any, i: number) => {
              return (
                <div key={i} className="item-card">
                  <img src={image.image} alt="cards" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
