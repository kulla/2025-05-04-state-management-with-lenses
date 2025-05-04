import '@picocss/pico/css/pico.min.css'
import './App.css'
import { useState } from 'react'

const exampleExercise: MultipleChoiceExercise = {
  type: 'multiple-choice-exercise',
  title: text('Which of the following are programming languages?'),
  solutions: [
    { type: 'solution', answer: text('JavaScript'), correct: true },
    { type: 'solution', answer: text('HTML'), correct: false },
    { type: 'solution', answer: text('Python'), correct: true },
    { type: 'solution', answer: text('CSS'), correct: false },
  ],
}

function text(value: string): Text {
  return { type: 'text', value }
}

export default function App() {
  const [state, setState] = useState<MultipleChoiceExercise>(exampleExercise)

  return <main className="content">{render(state)}</main>
}

function render(entity: Entity) {
  switch (entity.type) {
    case 'multiple-choice-exercise':
      return renderMultipleChoiceExercise(entity)
    case 'solution':
      return renderSolution(entity)
    case 'text':
      return renderText(entity)
    default:
      return null
  }
}

function renderMultipleChoiceExercise(exercise: MultipleChoiceExercise) {
  return (
    <section>
      <h2>{render(exercise.title)}</h2>
      <ul>
        {exercise.solutions.map((solution) => (
          <li key={solution.answer.value}>{render(solution)}</li>
        ))}
      </ul>
    </section>
  )
}

function renderSolution(solution: Solution) {
  return (
    <label>
      <input type="checkbox" />
      {render(solution.answer)}
    </label>
  )
}

function renderText(text: Text) {
  return <span>{text.value}</span>
}

interface Text {
  type: 'text'
  value: string
}

interface Solution {
  type: 'solution'
  answer: Text
  correct: boolean
}

interface MultipleChoiceExercise {
  type: 'multiple-choice-exercise'
  title: Text
  solutions: Solution[]
}

type Entity = MultipleChoiceExercise | Solution | Text
