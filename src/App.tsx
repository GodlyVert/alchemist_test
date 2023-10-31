import React, { useState, useEffect, useCallback } from 'react';
import gamesData from './games.json';
import { Game, Question } from './types';
import styles from './App.module.css';

function App() {
    const [questions, setQuestions] = useState<Question[]>(() => {
        const savedState = localStorage.getItem('appState');
        return savedState ? JSON.parse(savedState).questions : [];
    });

    const [time, setTime] = useState<number>(() => {
        const savedState = localStorage.getItem('appState');
        return savedState ? JSON.parse(savedState).time : 17 * 60;
    });

    const [isTimeUp, setIsTimeUp] = useState<boolean>(() => {
        const savedState = localStorage.getItem('appState');
        return savedState ? JSON.parse(savedState).isTimeUp : false;
    });

    const [isLocked, setIsLocked] = useState<boolean>(() => {
        const savedState = localStorage.getItem('appState');
        return savedState ? JSON.parse(savedState).isLocked : false;
    });

    const [isTimerRunning, setIsTimerRunning] = useState<boolean>(() => {
        const savedState = localStorage.getItem('appState');
        return savedState ? JSON.parse(savedState).isTimerRunning : false;
    });

    const [userName, setUserName] = useState<string>(() => {
        const savedState = localStorage.getItem('appState');
        return savedState ? JSON.parse(savedState).userName : '';
    });

    const [isTestStarted, setIsTestStarted] = useState<boolean>(() => {
        const savedState = localStorage.getItem('appState');
        return savedState ? JSON.parse(savedState).isTestStarted : false;
    });

    const [resultsSent, setResultsSent] = useState<boolean>(() => {
        const savedState = localStorage.getItem('appState');
        return savedState ? JSON.parse(savedState).resultsSent : false;
    });

    const [isNameValid, setIsNameValid] = useState<boolean>(true);

    const handleUserNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        const isValid = /^[A-Za-z]+$/.test(name);
        setIsNameValid(isValid);
        if (isValid || name === "") {
            setUserName(name);
        }
    };

    const formatTime = useCallback(() => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }, [time]);

    const webhookUrl = process.env.REACT_APP_DISCORD_WEBHOOK_URL;

    useEffect(() => {
        if (isTestStarted && questions.length === 0) {
            const selectedQuestions = gamesData.map((game: Game) => {
                const randomIndex = Math.floor(Math.random() * game.questions.length);
                return {
                    game: game.game,
                    question: game.questions[randomIndex].question,
                    correctAnswer: game.questions[randomIndex].answer,
                    answer: ''
                };
            });
            setQuestions(selectedQuestions);
            setIsTimerRunning(true);
        }
    }, [isTestStarted, questions.length]);

    useEffect(() => {
        if (!isTimerRunning) return;

        const timerId = setInterval(() => {
            setTime((prevTime) => {
                if (prevTime > 0) {
                    return prevTime - 1;
                } else {
                    setIsTimeUp(true);
                    setIsTimerRunning(false);
                    clearInterval(timerId);
                    return 0;
                }
            });
        }, 1000);

        return () => clearInterval(timerId);
    }, [isTimerRunning]);

    const handleStartTest = () => {
        setIsTestStarted(true);
    };

    const handleLock = () => {
        setIsLocked(true);
        setIsTimeUp(true);
        setIsTimerRunning(false);
    };

    const handleAnswerChange = (index: number, answer: string) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index].answer = answer;
        setQuestions(updatedQuestions);
    };

    const saveResultsAsHTML = useCallback(async (userName: string) => {
        const styles = `
@import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@300;400&display=swap');
body {
  font-family: 'Roboto Mono', monospace;
  padding: 20px;
  margin: 0;
  color: black;
  text-align: center;
}
.question-block {
  text-align: left;
}
h1 {
  font-size: 2em;
  margin-bottom: 20px;
}
.info, .info div {
  margin-bottom: 20px;
}
.info strong, li strong {
  color: #4CAF50;
}
ul {
  list-style: none;
  padding: 0;
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
}
li {
  margin-bottom: 10px;
}
p {
  font-family: 'Roboto Mono', monospace;
  margin: 0;
}
.strongGreen {
  color: #4CAF50;
}
.radio-group {
  margin-top: 10px;
}
.custom-radio {
  display: inline-block;
}
.custom-radio input[type="radio"] {
  display: none;
}
.custom-radio label {
  display: inline-block;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  position: relative;
  margin: 0 3px;
  cursor: pointer;
}
.custom-radio label span {
  display: block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0);
  transition: transform 0.3s ease;
  background-color: #fff;
}
.custom-radio input[type="radio"]:checked + label span {
  transform: translate(-50%, -50%) scale(1);
}
.red label {
  background: #e74c3c;
}
.light-red label {
  background: #e7827e;
}
.yellow label {
  background: #f1c40f;
}
.light-green label {
  background: #b3d98e;
}
.green label {
  background: #2ecc71;
}
.line {
  border-top: 2px solid #351723;
  margin-top: 10px;
  width: 100%;
}
`;


        const htmlContent = `
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Результаты Теста</title>
  <style>${styles}</style>
</head>
<body>
  <h1>Результаты Теста</h1>
  <div class="info">
    <div><strong>Имя:</strong> ${userName}</div>
    <div><strong>Оставшееся время:</strong> ${formatTime()}</div>
  </div>
  <ul>
   ${questions.map((q, index) => `
  <li class="question-block">
    <div>
      <strong class="strongGreen">${q.game}:</strong> ${q.question}
    </div>
    <p><strong class="strongGreen">Ответ:</strong> ${q.answer}</p>
    <p><strong class="strongGreen">Правильный ответ:</strong> ${q.correctAnswer}</p>
    <div class="radio-group" id="score${index}">
      <div class="custom-radio red">
        <input type="radio" id="score${index}-0" name="score${index}" value="0">
        <label for="score${index}-0"><span></span></label>
      </div>
      <div class="custom-radio light-red">
        <input type="radio" id="score${index}-0.25" name="score${index}" value="0.25">
        <label for="score${index}-0.25"><span></span></label>
      </div>
      <div class="custom-radio yellow">
        <input type="radio" id="score${index}-0.5" name="score${index}" value="0.5">
        <label for="score${index}-0.5"><span></span></label>
      </div>
      <div class="custom-radio light-green">
        <input type="radio" id="score${index}-0.75" name="score${index}" value="0.75">
        <label for="score${index}-0.75"><span></span></label>
      </div>
      <div class="custom-radio green">
        <input type="radio" id="score${index}-1" name="score${index}" value="1">
        <label for="score${index}-1"><span></span></label>
      </div>
    </div>
    <div class="line"></div>
  </li>
`).join('')}

  </ul>
  <div id="totalScore" style="margin-top: 20px;"><strong class="strongGreen">Сумма баллов:</strong> 0</div>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const container = document.body;
      container.addEventListener('change', (event) => {
        if (event.target.closest('.radio-group')) {
          calculateTotal();
        }
      });

      function calculateTotal() {
        var total = 0;
        var radios;
        ${questions.map((_, index) => `
          radios = document.getElementsByName('score${index}');
          for (const radio of radios) {
            if (radio.checked) {
              total += parseFloat(radio.value);
              break;
            }
          }
        `).join('')}
        document.getElementById('totalScore').innerHTML = '<strong class="strongGreen">Сумма баллов:</strong> ' + total.toFixed(2);
      };
    });
  </script>
</body>
</html>
`;
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const formData = new FormData();
        formData.append('file', blob, `${userName}_results.html`);

        try {
            if (typeof webhookUrl === 'undefined') {
                throw new Error('webhookUrl is undefined');
            }
            const response = await fetch(webhookUrl, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            console.log('Файл успешно отправлен');
        } catch (error) {
            console.error('Ошибка при отправке файла:', error);
        }
    }, [questions, formatTime, webhookUrl]);

    useEffect(() => {
        if ((isTimeUp || isLocked) && !resultsSent && questions.length > 0) {
            const results = {
                userName,
                remainingTime: formatTime(),
                answers: questions
            };
            localStorage.setItem('testResults', JSON.stringify(results));
            saveResultsAsHTML(userName)
                .then(() => setResultsSent(true))
                .catch((error) => console.error('Ошибка при отправке результатов:', error));
        }
    }, [isTimeUp, isLocked, userName, questions, formatTime, resultsSent, saveResultsAsHTML]);


    useEffect(() => {
        const state = {
            questions,
            time,
            isTimeUp,
            isLocked,
            isTimerRunning,
            userName,
            isTestStarted,
            resultsSent,
        };
        localStorage.setItem('appState', JSON.stringify(state));
    }, [questions, time, isTimeUp, isLocked, isTimerRunning, userName, isTestStarted, resultsSent]);


    return (
        <div className={styles.App}>
            {!isTestStarted ? (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <input
                            type="text"
                            placeholder="Введите никнейм Discord, только английский"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            pattern="[A-Za-z0-9]+"
                        />
                        {!/^[A-Za-z0-9]+$/.test(userName) && userName.length > 0 && (
                            <div className={styles.warning}>
                                Никнейм может содержать только английские буквы и цифры
                            </div>
                        )}
                        <button
                            className={`${styles.startButton}`}
                            onClick={handleStartTest}
                            disabled={!userName || !/^[A-Za-z0-9]+$/.test(userName)}
                        >
                            Начать тест
                        </button>
                    </div>
                </div>
            ) : (
                <div>
                    <div className={styles.timer}>
                        {formatTime()}
                    </div>
                    <h1>Тест на алхимика</h1>
                    <ul className={styles.questionsContainer}>
                        {questions.map((q, index) => (
                            <li key={index} className={styles.questionContainer}>
                                <div className={styles.question}>
                                    <strong>{q.game}:</strong> {q.question}
                                </div>
                                <input
                                    type="text"
                                    placeholder="Ваш ответ..."
                                    disabled={isTimeUp}
                                    value={q.answer}
                                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                                />
                            </li>
                        ))}
                    </ul>
                    <button className={styles.lockButton} onClick={handleLock} disabled={isLocked}>
                        Завершить тест
                    </button>
                </div>
            )}
        </div>
    );
}

export default App;


