import React, { useEffect, useState, useCallback } from "react";
import Joke from "./Joke";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

import "./JokeList.css";

function JokeList(props) {
  const oldJokes = JSON.parse(window.localStorage.getItem("jokes"));
  const [jokes, setJokes] = useState(oldJokes || []);
  const [loading, setLoading] = useState(false);
  const seenJokes = new Set(jokes.map((j) => j.text));
  let sortedJokes = jokes.sort((a, b) => b.votes - a.votes);

  async function fetchJokes() {
    try {
      let jokesList = [];
      while (jokesList.length < props.numJokesToGet) {
        let res = await axios.get("https://icanhazdadjoke.com/", {
          headers: { Accept: "application/json" },
        });
        let newJoke = res.data.joke;
        if (!seenJokes.has(newJoke)) {
          jokesList.push({ id: uuidv4(), text: newJoke, votes: 0 });
        } else {
          console.log("FOUND A DUPLICATE!");
          console.log(newJoke);
        }
      }
      setJokes([...jokes, ...jokesList]);
      setLoading(false);
    } catch (error) {
      alert(error);
      setLoading(false);
    }
  }

  useEffect(() => {
    if (jokes.length === 0) fetchJokes();
  }, []);

  useEffect(() => {
    window.localStorage.setItem("jokes", JSON.stringify(jokes));
  }, [jokes]);

  function handleVote(id, delta) {
    const updatedJokes = jokes.map((j) => {
      if (j.id === id) {
        return { ...j, votes: j.votes + delta };
      }
      return j;
    });
    setJokes(updatedJokes);
    window.localStorage.setItem("jokes", JSON.stringify(jokes));
  }

  function handleClick() {
    setLoading(true);
    fetchJokes();
  }

  let rendered;
  if (loading) {
    rendered = (
      <div className="JokeList-spinner">
        <i className="far fa-8x fa-laugh fa-spin" />
        <h1 className="JokeList-title">Loading...</h1>
      </div>
    );
  } else {
    rendered = (
      <div className="JokeList">
        <div className="JokeList-sidebar">
          <h1 className="JokeList-title">
            <span>Dad</span> Jokes
          </h1>
          <img
            src="https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg"
            alt=""
          />
          <button onClick={handleClick} className="JokeList-getmore">
            Fetch Jokes
          </button>
        </div>
        <div className="JokeList-jokes">
          {sortedJokes.map((j) => (
            <Joke
              key={j.id}
              {...j}
              upvote={() => handleVote(j.id, 1)}
              downvote={() => handleVote(j.id, -1)}
            />
          ))}
        </div>
      </div>
    );
  }
  return rendered;
}

JokeList.defaultProps = {
  numJokesToGet: 10,
};

export default JokeList;
