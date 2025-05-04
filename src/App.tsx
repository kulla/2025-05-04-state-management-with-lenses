import '@picocss/pico/css/pico.min.css'
import './App.css'
import { useState } from 'react'

const exampleExercise: MultipleChoiceExercise = {
  type: 'multiple-choice-exercise',
  title: 'Which of the following are programming languages?',
  solutions: [
    { answer: 'JavaScript', correct: true },
    { answer: 'HTML', correct: false },
    { answer: 'Python', correct: true },
    { answer: 'CSS', correct: false },
  ],
}

export default function App() {
  const [state, setState] = useState<MultipleChoiceExercise>(exampleExercise)

  return <main className="content">{render(state)}</main>
}

function render(exercise: MultipleChoiceExercise) {
  return (
    <section>
      <h2>{exercise.title}</h2>
      <ul>
        {exercise.solutions.map((solution) => (
          <li key={solution.answer}>
            <label>
              <input type="checkbox" />
              {solution.answer}
            </label>
          </li>
        ))}
      </ul>
    </section>
  )
}

interface MultipleChoiceExercise {
  type: 'multiple-choice-exercise'
  title: string
  solutions: Solution[]
}

interface Solution {
  answer: string
  correct: boolean
}
