import type { NextPage } from "next";
import Head from "next/head";
import { useCallback, useEffect, useState } from "react";
import * as branding from "./branding";

import { ChoiceContext, questions } from "./questions";

import styles from "../styles/Home.module.css";
import questionStyles from "../styles/Question.module.scss";

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

  function nextStep() {
    setStep((s) => Math.min(questions.length * 2 - 1, s + 1));
  }

  function previousStep() {
    setStep((s) => Math.max(0, s - 1));
  }

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      switch (e.key) {
        case " ":
        case "ArrowRight":
          nextStep();
          return;
        case "Backspace":
        case "ArrowLeft":
          previousStep();
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
        <title>{branding.title}</title>
        <meta name="description" content={branding.title} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>{branding.title}</h1>

        <br />
        <br />

        <ChoiceContext.Provider value={{ nextStep }}>

        {questions
          .slice(0, questionNumber + 1 + (presenterMode ? 1 : 0))
          .map((item, currentQuestion) => {
            if ("section" in item) {
              return <h2 key={currentQuestion} className={styles.sectionTitle}>{item.section}</h2>;
            } else if ("block" in item) {
              return <div className={questionStyles.block} key={currentQuestion}>{item.block}</div>;
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
                  <QuestionRow
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
          </ChoiceContext.Provider>
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

function QuestionRow({
  index,
  question,
  answer,
  showAnswer,
  past,
  onClick,
}: QuestionProps) {
  return (
    <div className={questionStyles.questionRow} data-past={past ? true : undefined} onClick={onClick}>
      <div className={questionStyles.index}>{index}</div>
      <div className={questionStyles.question}>{question}</div>
      <div
        className={questionStyles.answer}
        style={{ opacity: showAnswer ? 1 : presenterMode ? 0.1 : 0 }}
      >
        {answer}
      </div>
    </div>
  );
}

export default Home;
