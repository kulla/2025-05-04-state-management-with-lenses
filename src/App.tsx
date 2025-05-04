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

  return <main className="content">{render({ value: state, path: [] })}</main>
}

function render({ value, path }: StateValue<Entity>) {
  switch (value.type) {
    case 'multiple-choice-exercise':
      return renderMultipleChoiceExercise({ value, path })
    case 'solution':
      return renderSolution({ value, path })
    case 'text':
      return renderText({ value, path })
    default:
      return null
  }
}

function renderMultipleChoiceExercise(
  stateValue: StateValue<MultipleChoiceExercise>,
) {
  const solutions = get(stateValue, 'solutions')

  return (
    <section>
      <h2>{render(get(stateValue, 'title'))}</h2>
      <ul>
        {map(solutions, (solution) => (
          <li key={solution.value.answer.value}>{render(solution)}</li>
        ))}
      </ul>
    </section>
  )
}

function renderSolution(state: StateValue<Solution>) {
  return (
    <label {...dataTypes(state)}>
      <input type="checkbox" />
      {render(get(state, 'answer'))}
    </label>
  )
}

function renderText(state: StateValue<Text>) {
  return <span {...dataTypes(state)}>{state.value.value}</span>
}

function dataTypes({ value, path }: StateValue<unknown>) {
  return {
    'data-path': JSON.stringify(path),
    ...(isEntity(value) ? { 'data-type': value.type } : {}),
  }
}

function isEntity(value: unknown): value is Entity {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    typeof value.type === 'string'
  )
}

function map<E, R>(
  { value, path }: StateValue<Array<E>>,
  callback: (value: StateValue<E>) => R,
): Array<R> {
  return value.map((item, index) =>
    callback({ value: item, path: [...path, index] }),
  )
}

function get<T, K extends keyof T & (string | number)>(
  { value, path }: StateValue<T>,
  key: K,
): StateValue<T[K]> {
  return { value: value[key], path: [...path, key] }
}

interface StateValue<A> {
  value: A
  path: Array<string | number>
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
