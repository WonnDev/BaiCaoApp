import React, { useEffect, useReducer, useState } from "react";
import axios from "axios";

// Khởi tạo trạng thái ban đầu của trò chơi
const initialState = {
  players: [
    {
      name: "Player A",
      coins: 5000,
      points: 0,
      point: 0,
      gameOver: false,
      cards: [],
    },
    {
      name: "Player B",
      coins: 5000,
      points: 0,
      point: 0,
      gameOver: false,
      cards: [],
    },
    {
      name: "Player C",
      coins: 5000,
      points: 0,
      point: 0,
      gameOver: false,
      cards: [],
    },
    {
      name: "Player D",
      coins: 5000,
      points: 0,
      point: 0,
      gameOver: false,
      cards: [],
    },
  ],
  deckId: null,
  deckCardRemaining: null,
  revael: false,
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
      const clearCards = state?.players?.map((player: any) => {
        return {
          ...player,
          cards: [],
        };
      });
      return {
        ...state,
        players: clearCards,
        deckId: action.payload.deck_id,
        deckCardRemaining: action.payload.remaining,
        revael: false,
        drawn: false,
      };

    case "DRAW_CARDS":
      // Xử lý chia bai
      const updatedPlayersCards = state?.players?.map(
        (player: any, index: any) => {
          // Chia bài (3 lá) cho mỗi người chơi từ các lá bài đã lấy
          const playerCards = action.payload.cards.slice(
            index * 3,
            (index + 1) * 3
          );
          return {
            ...player,
            cards: player.coins < 900 ? [] : playerCards,
            gameOver: player.coins < 900 ? true : false,
          };
        }
      );
      // console.log("updatePlayerCard(): ", updatedPlayersCards);
      return {
        ...state,
        players: updatedPlayersCards,
        deckCardRemaining: action.payload.remaining,
        drawn: true,
        revael: false,
        gameOver: false,
      };

    case "REVEAL_CARDS":
      // Xử lý việc tính điểm và xác định người thắng
      // Create arr
      let pointList: any = [];

      // Get player from playerList
      const updatedPlayerPoint = state?.players?.map((player: any) => {
        // Get card from player and trans then parse all to int
        const value: any = player.cards.map((cardList: any) => {
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
        const parseValue: any = value.reduce(
          (prev: any, currentCardPoint: any) => {
            return prev + currentCardPoint;
          },
          0
        );

        // Get item for pointList
        pointList.push(parseValue % 10);

        return {
          ...player,
          points: parseValue,
          point: parseValue % 10,
        };
      });

      // Get Max point
      const maxPoint = pointList?.reduce(function (
        accumulator: any,
        element: any
      ) {
        return accumulator > element ? accumulator : element;
      });

      // Trừ tiền từ người chơi thua , Deduct money from the losing player
      const winners: any = [];
      const losers: any = [];
      const updatedPlayerCoin = updatedPlayerPoint.map((player: any) => {
        if (player.point === maxPoint) winners.push(player.name);
        if (!winners.includes(player.name)) {
          // Trừ 900 coins nếu người chơi thua
          if (player.coins > 900) {
            player.coins -= 900;
            losers.push(player.name);
          } else {
            player.gameOver = true;
          }
        }
        return { ...player };
      });
      console.log(losers);
      const updatedListPlayers = updatedPlayerCoin.filter(
        (player: any) => player.gameOver === false
      );
      // console.log("updatedListPlayers:", updatedListPlayers.length);

      return {
        ...state,
        players: updatedListPlayers,
        winners: winners,
        losers: losers,
        gameOver: true,
        revael: true,
      };

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
  const [hide, setHide] = useState(false);
  const [show, setShow] = useState(Boolean);
  const [backCard, setBackCard] = useState("");

  const shuffleDeck = () => {
    setIsShuffling(true);
    setTimeout(() => {
      setIsShuffling(false);
    }, 300);
    //Trộn bài
    axios
      .get(`https://deckofcardsapi.com/api/deck/${state.deckId}/shuffle/`)
      .then((res) => {
        dispatch({
          type: "SHUFFLE_CARDS",
          payload: res.data,
        });
      })
      .catch((error) => {
        console.error("Error shuffling deck:", error);
      });
  };

  const drawCards = () => {
    if (state.deckCardRemaining < state.players.length * 3) {
      window.alert("Not Enough Card, Please Shuffle!");
    } else {
      setShow(false);
      setHide(false);
      setIsDrawing(true);
      setTimeout(() => {
        setIsDrawing(false);
      }, 600);
      // Chia bài
      axios
        .get(
          `https://deckofcardsapi.com/api/deck/${state.deckId}/draw/?count=${
            state.players.length * 3
          }`
        )
        .then((res) => {
          dispatch({
            type: "DRAW_CARDS",
            payload: res.data,
          });
        })
        .catch((error) => {
          console.error("Error drawing cards:", error);
        });
    }
  };
  const revealCards = () => {
    setShow(true);
    setHide(true);
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
    setHide(false);
    setIsShuffling(false);
    setIsDrawing(false);
    setIsRevealing(false);
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
  const CardHost = (props: any) => {
    return (
      <>
        {state?.players?.[props.value].cards?.map((img?: any, i?: number) => {
          return (
            <div key={i}>
              <img src={img.image} alt="cards" />
            </div>
          );
        })}
      </>
    );
  };
  const CardHostback = () => {
    return (
      <>
        <div className="mask-cards">
          <img src={backCard} alt="cards" />
          <img src={backCard} alt="cards" />
          <img src={backCard} alt="cards" />
        </div>
      </>
    );
  };
  const InfoPlayer = (props: any) => {
    return (
      <>
        {!state.gameOver ? (
          `${state?.players?.[props.value].name}`
        ) : (
          <div className="player-other">
            <p>
              Point:{" "}
              {state?.players?.[props.value]
                ? `${state?.players?.[props.value].point}`
                : ""}{" "}
            </p>
            <p>
              Coins:{" "}
              {state?.players?.[props.value]
                ? `${state?.players?.[props.value].coins}`
                : ""}
            </p>
            <p>
              <b style={{ fontSize: "13px" }}>
                {state?.players?.[props.value]
                  ? `${state?.players?.[props.value].name}`
                  : ""}
              </b>
            </p>
            <p>
              Point of 3 cards:{" "}
              {state?.players?.[props.value]
                ? `${state?.players?.[props.value].points}`
                : ""}
            </p>
          </div>
        )}
      </>
    );
  };

  useEffect(() => {
    // Call API to get card, save deckId to state
    axios
      .get("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1")
      .then((res) => {
        dispatch({
          type: "SET_DECK_ID",
          payload: res.data,
        });
        console.log("Start!");
      })
      .catch(console.error);
    axios
      .get("https://deckofcardsapi.com/static/img/back.png")
      .then((res) => {
        const imageURL: any = res.config.url;
        setBackCard(imageURL);
      })
      .catch(console.error);
    revealCards();
    resetGame();
  }, []);
  useEffect(() => {
    if (state?.gameOver) {
      if (state?.players?.length === 1) {
        window.alert(`Congratulation ${state?.players?.[0].name}!`);
      } else if (
        state?.players?.length === 2 &&
        state?.players?.[0].coins < 900 &&
        state?.players?.[1].coins < 900
      ) {
        window.alert(
          `Drawn Match! Congratulation ${state?.players?.[0].name} and ${state?.players?.[1].name}!`
        );
      }
    }
  }, [state]);

  return (
    <div id="view_player">
      <div className="group-view border">
        <div className="cards">
          {state?.players?.[0] ? <CardHost value={0} /> : ""}
        </div>
        <div className="user-info">
          <p>
            Point: {state?.players?.[0] ? `${state?.players?.[0].point}` : ""}
          </p>
          <p>
            Coins: {state?.players?.[0] ? `${state?.players?.[0].coins}` : ""}
          </p>
          <p>
            <b style={{ fontSize: "22px" }}>
              {state?.players?.[0]
                ? `${state?.players?.[0].name}`
                : "Lost Player"}
            </b>
          </p>
          <p>
            Point of 3 cards:
            {state?.players?.[0] ? `${state?.players?.[0].points}` : ""}
          </p>
        </div>
      </div>
      <div className="noti">
        <div>
          {!hide ? (
            ""
          ) : (
            <div>{state?.winners ? `Winner: ${state?.winners[0]}` : ""}</div>
          )}
          {!hide ? (
            ""
          ) : (
            <div style={{ color: "gray" }}>
              {state?.losers
                ? `Losers: ${state?.losers[0]}, ${state?.losers[1]}, ${state?.losers[2]}`
                : ""}
            </div>
          )}
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
              drawCards();
            }}
          >
            {isDrawing ? "Drawing..." : "Draw"}
          </button>
          <button
            className="border border-btn"
            style={{ backgroundColor: "#272727" }}
            type="button"
            disabled={isRevealing || state?.revael || !state?.drawn}
            onClick={revealCards}
          >
            {isRevealing ? "Revealing..." : "Reveal"}
          </button>
        </div>
        <button
          className="border border-btn btn-reset"
          type="button"
          onClick={() => {
            resetGame();
          }}
        >
          Reset
        </button>
      </div>
      <div className="group-other-player">
        <div className="other-player-top other-player border">
          {!state?.players?.[1] ? "Lost Player" : <InfoPlayer value={1} />}
          <div className="cards-player">
            {state?.players?.[1] ? (
              <>{!!!show ? <CardHostback /> : <CardHost value={1} />}</>
            ) : (
              ""
            )}
          </div>
        </div>
        <div className="other-player-left other-player border">
          {!state?.players?.[2] ? "Lost Player" : <InfoPlayer value={2} />}
          <div className="cards-player">
            {state?.players?.[2] ? (
              <>{!show ? <CardHostback /> : <CardHost value={2} />}</>
            ) : (
              ""
            )}
          </div>
        </div>
        <div className="other-player-right other-player border">
          {!state?.players?.[3] ? "Lost Player" : <InfoPlayer value={3} />}
          <div className="cards-player">
            {state?.players?.[3] ? (
              <>{!show ? <CardHostback /> : <CardHost value={3} />}</>
            ) : (
              ""
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
