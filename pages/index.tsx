import type { NextPage } from "next";
import Head from "next/head";
import { useCallback, useEffect, useState } from "react";

import { questions } from "./questions";

import styles from "../styles/Home.module.css";

const presenterMode = (() => {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    return params.get("presenter") !== null ? true : false;
  } else {
    return false;
  }
})();

const Home: NextPage = () => {
  const [step, setStep] = useState(0);
  const [highlights, setHighlights] = useState<number[]>([]);

  const reload = useCallback(() => {
    const raw = localStorage.getItem("step");
    if (raw) {
      setStep(JSON.parse(raw));
    }
    const rawHighlight = localStorage.getItem("highlights");
    if (rawHighlight) {
      setHighlights(JSON.parse(rawHighlight));
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    window.scrollTo(0, document.body.scrollHeight);
    setHighlights([]);
    localStorage.setItem("step", JSON.stringify(step));
  }, [step]);

  useEffect(() => {
    localStorage.setItem("highlights", JSON.stringify(highlights));
  }, [highlights]);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      switch (e.key) {
        case " ":
        case "ArrowRight":
          setStep((s) => Math.min(questions.length * 2 - 1, s + 1));
          return;
        case "Backspace":
        case "ArrowLeft":
          setStep((s) => Math.max(0, s - 1));
          return;
        case "Home":
          setStep(0);
          return;
      }
    }
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
    };
  }, []);

  useEffect(() => {
    function handler() {
      reload();
    }
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("storage", handler);
    };
  }, [reload]);

  useEffect(() => {
    function handler() {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        document.documentElement.requestFullscreen();
      }
    }
    document.addEventListener("dblclick", handler);
    return () => document.removeEventListener("dblclick", handler);
  }, []);

  const questionNumber = (step / 2) | 0;
  const isAnswer = step % 2 === 1;

  return (
    <div className={styles.container}>
      <Head>
        <title>The Little TypeScripter</title>
        <meta name="description" content="The Little TypeScripter" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>The Little TypeScripter</h1>

        <br />
        <br />

        {questions
          .slice(0, questionNumber + 1 + (presenterMode ? 1 : 0))
          .map((item, currentQuestion) => {
            if ("section" in item) {
              return <h2 key={currentQuestion}>{item.section}</h2>;
            } else {
              const { question, answer } = item;
              const pastQuestion = currentQuestion < questionNumber;
              const futureQuestion = currentQuestion > questionNumber;

              const style = {
                width: "100%",
                ...(futureQuestion
                  ? { backgroundColor: "#e5e5e5", opacity: 0.5 }
                  : {}),
              };

              return (
                <div style={style} key={currentQuestion}>
                  <Question
                    key={currentQuestion}
                    index={currentQuestion}
                    question={question}
                    showAnswer={
                      currentQuestion < questionNumber ||
                      (currentQuestion === questionNumber && isAnswer)
                    }
                    answer={answer}
                    past={pastQuestion && !highlights.includes(currentQuestion)}
                    onClick={() => {
                      setHighlights((a) => [...a, currentQuestion]);
                    }}
                  />
                </div>
              );
            }
          })}
      </main>
    </div>
  );
};

interface QuestionProps {
  index: number;
  question: JSX.Element;
  answer: JSX.Element;
  showAnswer: boolean;
  past: boolean;
  onClick: () => void;
}

function Question({
  index,
  question,
  answer,
  showAnswer,
  past,
  onClick,
}: QuestionProps) {
  return (
    <div className="row" onClick={onClick}>
      <div className="index">{index}</div>
      <div className="question">{question}</div>
      <div
        className="answer"
        style={{ opacity: showAnswer ? 1 : presenterMode ? 0.1 : 0 }}
      >
        {answer}
      </div>
      <style jsx>
        {`
          .row {
            display: flex;
            width: 100%;
            border-bottom: 1px solid #e8e8e8;
            min-height: 50px;
            padding-top: 10px;
            padding-bottom: 10px;
            opacity: ${past ? 0.3 : 1};
            gap: 20px;
          }

          .question,
          .answer {
            width: 100%;
          }

          .index {
            position: "absolute";
            left: 0;
            top: 0;
            font-size: 0.7em;
          }
        `}
      </style>
    </div>
  );
}

export default Home;
