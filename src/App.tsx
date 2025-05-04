import '@picocss/pico/css/pico.min.css'
import './App.css'
import { useEffect, useState } from 'react'

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
  const [selection, setSelection] = useState<Position | null>(null)

  useEffect(() => {
    function handleSeletionChange() {
      const selection = window.getSelection()

      if (selection == null || !selection.isCollapsed) {
        setSelection(null)
        return
      }

      const { anchorNode, anchorOffset } = selection
      const { path, type } = getDataTypes(anchorNode)

      if (path == null) {
        setSelection(null)
        return
      }

      if (type === 'text') {
        setSelection({ path, offset: anchorOffset })
      } else {
        setSelection({ path })
      }
    }

    document.addEventListener('selectionchange', handleSeletionChange)

    return () => {
      document.removeEventListener('selectionchange', handleSeletionChange)
    }
  })

  return (
    <main className="content">
      <h1>Editable Multiple Choice Exercise</h1>
      <hr />
      <div contentEditable suppressContentEditableWarning spellCheck={false}>
        {render({ value: state, path: [] })}
      </div>
      <hr />
      <h2>State</h2>
      <pre>selection: {JSON.stringify(selection, null, 2)}</pre>
    </main>
  )
}

function getDataTypes(node: Node | null): {
  path: Path | null
  type: string | null
} {
  if (node == null) return { path: null, type: null }
  if (!isElement(node)) return getDataTypes(node.parentNode)

  const dataPath = node.getAttribute('data-path')
  const dataType = node.getAttribute('data-type')

  if (dataPath == null) return getDataTypes(node.parentNode)

  const path = JSON.parse(dataPath)

  return {
    path,
    ...(dataType ? { type: dataType } : { type: null }),
  }
}

function isElement(node: Node): node is Element {
  return node.nodeType === Node.ELEMENT_NODE
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
    <section {...dataTypes(stateValue)}>
      <p>
        <b>Exercise:</b> {render(get(stateValue, 'title'))}
      </p>
      <ul>{map(solutions, render)}</ul>
    </section>
  )
}

function renderSolution(state: StateValue<Solution>) {
  return (
    <li key={state.value.answer.value} {...dataTypes(state)}>
      <input type="checkbox" />
      {render(get(state, 'answer'))}
    </li>
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
  path: Path
}

interface Position {
  path: Path
  offset?: number
}

type Path = Array<string | number>

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
