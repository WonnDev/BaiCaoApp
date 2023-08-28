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
      name: "Player D (You)",
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
        winners: [],
        losers: [],
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
            cards: player.gameOver === true ? [] : playerCards,
          };
        }
      );
      return {
        ...state,
        players: updatedPlayersCards,
        deckCardRemaining: action.payload.remaining,
        drawn: true,
        revael: false,
        winners: [],
        losers: [],
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
            if (player.coins < 900) {
              player.gameOver = true;
            }
          }
        }
        return { ...player };
      });
      // Lọc những người chơi đã thua cuộc ra khỏi danh sách Players
      const updatedListPlayers = updatedPlayerCoin.filter(
        (player: any) => player.gameOver === false
      );

      return {
        ...state,
        // players: updatedListPlayers,
        players: updatedPlayerCoin,
        winners: winners,
        losers: losers,
        // gameOver: losers.length === 0 ? true : false,
        gameOver: updatedListPlayers.length === 1 ? true : false,
        revael: true,
      };

    case "RESET_GAME":
      // Reset cards per player
      return {
        ...initialState,
        deckId: action.payload.deck_id,
        deckCardRemaining: action.payload.remaining,
        shuffle: action.payload.shuffed,
        winners: [],
        losers: [],
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
  const [show, setShow] = useState(false);
  const [notiShuffle, setNotiShuffle] = useState(false);
  const [backCard, setBackCard] = useState("");

  const shuffleDeck = () => {
    setNotiShuffle(false);
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
    const listPlayers = state.players.filter(
      (player: any) => player.gameOver === false
    );
    if (state.deckCardRemaining < listPlayers.length * 3) {
      // window.alert("Not Enough Cards, Please Shuffle!");
      state.revael = false;
      setNotiShuffle(true);
    } else {
      setShow(false);
      setIsDrawing(true);
      setTimeout(() => {
        setIsDrawing(false);
      }, 600);
      // Chia bài
      axios
        .get(
          `https://deckofcardsapi.com/api/deck/${state.deckId}/draw/?count=${
            listPlayers.length * 3
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
      .catch(console.error);
  };
  const ListWinners = () => {
    return (
      <>
        {/* {state?.winners?.map((player: any) => {
          return `${player} `;
        })} */}
        {state?.winners?.join(", ")}
      </>
    );
  };
  const ListLosers = () => {
    return (
      <>
        {/* {state?.losers.map((player: any) => {
          return `${player} `;
        })} */}
        {state?.losers?.join(", ")}
      </>
    );
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
        {!state.revael ? (
          `${state?.players?.[props.value].name}`
        ) : (
          <div className="player-other-info">
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
  const NameNoCoin = (props: any) => {
    return (
      <>
        <div className="name-nocoins">
          <span>{state?.players?.[props.value].name}</span>
          <span>No Coins</span>
        </div>
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
  }, []);

  return (
    <div id="view_player">
      <div className="group-view border">
        <div className="cards">
          {state?.players?.[3] ? <CardHost value={3} /> : ""}
        </div>
        <div className="player-info">
          <p>
            Point:{state?.players?.[3] ? ` ${state?.players?.[3].point}` : ""}
          </p>
          <p>
            Coins:{state?.players?.[3] ? ` ${state?.players?.[3].coins}` : ""}
          </p>
          <p>
            <b className="name">
              {state?.players?.[3] ? `${state?.players?.[3].name}` : "No Coins"}
            </b>
          </p>
          <p>
            Point of 3 cards:
            {state?.players?.[3] ? ` ${state?.players?.[3].points}` : ""}
          </p>
        </div>
      </div>
      <div className="noti">
        <div className="noti-winnerslist">
          {!state.revael ? null : (
            <>
              {state?.gameOver === false && state?.winners ? "Winner: " : ""}
              {state?.gameOver && state?.winners ? "Congratulation: " : ""}
              <ListWinners />
            </>
          )}
        </div>
        <div className="noti-loserslist">
          {!state.revael ? null : (
            <>
              {state?.losers.length > 0 ? `Losers: ` : ""}
              <ListLosers />
            </>
          )}
        </div>
        <div className="noti-not-enough-cards">
          {/* {!state.draw && state.deckCardRemaining < state.players.length * 3 ? ( */}
          {notiShuffle ? "Not Enough Cards, Please Shuffle!" : null}
          {state.gameOver ? "Game Over, Please Reset!" : null}
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
            disabled={isShuffling || state?.gameOver}
            onClick={shuffleDeck}
          >
            {isShuffling ? "Shuffling..." : "Shuffle"}
          </button>
          <button
            className="border border-btn"
            style={{ backgroundColor: "#EBB844" }}
            type="button"
            disabled={isDrawing || state?.gameOver === true}
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
            disabled={
              isRevealing ||
              state?.revael ||
              !state?.drawn ||
              state?.gameOver === true
            }
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
          {state?.players?.[1].gameOver ? (
            <NameNoCoin value={1} />
          ) : (
            <InfoPlayer value={1} />
          )}
          <div className="cards-player">
            {state?.players?.[1] && state?.players?.[1].cards.length > 0 ? (
              <>{!show ? <CardHostback /> : <CardHost value={1} />}</>
            ) : (
              ""
            )}
            {/* {state?.players?.[1] ? (
              <>
                <>
                  {state?.players?.[1].cards.length > 0 && !state.revael ? (
                    <CardHostback />
                  ) : null}
                </>
                <>
                  {state?.players?.[1].cards.length > 0 && state.revael ? (
                    <CardHost value={1} />
                  ) : null}
                </>
              </>
            ) : (
              ""
            )} */}
          </div>
        </div>
        <div className="other-player-left other-player border">
          {state?.players?.[2].gameOver ? (
            <NameNoCoin value={2} />
          ) : (
            <InfoPlayer value={2} />
          )}
          <div className="cards-player">
            {state?.players?.[2] && state?.players?.[2].cards.length > 0 ? (
              <>{!show ? <CardHostback /> : <CardHost value={2} />}</>
            ) : (
              ""
            )}
          </div>
        </div>
        <div className="other-player-right other-player border">
          {state?.players?.[0].gameOver ? (
            <NameNoCoin value={0} />
          ) : (
            <InfoPlayer value={0} />
          )}
          <div className="cards-player">
            {state?.players?.[0] && state?.players?.[0].cards.length > 0 ? (
              <>{!show ? <CardHostback /> : <CardHost value={0} />}</>
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
