import '@picocss/pico/css/pico.min.css'
import './App.css'
import { useEffect, useLayoutEffect, useState, type FormEvent } from 'react'
import { over, lensPath } from 'ramda'

const exampleExercise: MultipleChoiceExercise = {
  type: 'multiple-choice-exercise',
  title: text('Which of the following are programming languages?'),
  solutions: [
    { answer: text('JavaScript'), correct: true },
    { answer: text('HTML'), correct: false },
    { answer: text('Python'), correct: true },
    { answer: text('CSS'), correct: false },
  ],
}

function text(value: string): Text {
  return { type: 'text', value }
}

export default function App() {
  const [state, setState] = useState<EditorState>({
    content: exampleExercise,
    selection: null,
  })

  const handleBeforeInput = (event: FormEvent<HTMLDivElement>) => {
    event.stopPropagation()

    if (!isInputEvent(event.nativeEvent)) return

    const { data } = event.nativeEvent

    if (typeof data !== 'string') return
    if (data.length === 0) return

    const { selection } = state

    if (selection == null) return

    const { path, offset } = selection

    if (offset == null) return

    setState(({ content }) => ({
      content: over(
        lensPath(path),
        ({ value }: Text) => {
          const newValue = value.slice(0, offset) + data + value.slice(offset)
          return text(newValue)
        },
        content,
      ),
      selection: { ...selection, offset: offset + data.length },
    }))
  }

  useEffect(() => {
    function handleSeletionChange() {
      const selection = window.getSelection()

      if (selection == null || !selection.isCollapsed) {
        setState(({ content }) => ({ content, selection: null }))
        return
      }

      const { anchorNode, anchorOffset } = selection
      const { path, type } = getDataTypes(anchorNode)

      if (path == null) {
        setState(({ content }) => ({ content, selection: null }))
        return
      }

      if (type === 'text') {
        setState(({ content }) => ({
          content,
          selection: { path, offset: anchorOffset },
        }))
      } else {
        setState(({ content }) => ({ content, selection: { path } }))
      }
    }

    document.addEventListener('selectionchange', handleSeletionChange)

    return () => {
      document.removeEventListener('selectionchange', handleSeletionChange)
    }
  })

  useLayoutEffect(() => {
    const windowSelection = window.getSelection()
    if (!windowSelection) return

    windowSelection.removeAllRanges()

    if (state.selection == null) return

    const { path, offset } = state.selection

    const anchorNode = document.querySelector(
      `[data-path='${JSON.stringify(path)}']`,
    )

    if (anchorNode == null) return

    if (offset == null) {
      const range = document.createRange()
      range.selectNode(anchorNode)
      windowSelection.addRange(range)
      return
    }

    const textNode = anchorNode.childNodes[0]

    const range = document.createRange()
    range.setStart(textNode, offset)
    range.setEnd(textNode, offset)

    windowSelection.addRange(range)
  }, [state.selection])

  return (
    <main className="content">
      <h1>Editable Multiple Choice Exercise</h1>
      <hr />
      <div
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
        onBeforeInput={handleBeforeInput}
        onKeyDown={(event) => {
          if (event.key.length > 1) event.preventDefault()
        }}
      >
        {render({ value: state.content, path: [], setState })}
      </div>
      <hr />
      <h2>State</h2>
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </main>
  )
}

function isInputEvent(event: Event): event is InputEvent {
  return 'data' in event
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

function render({ value, path, setState }: StateValue<Entity>) {
  switch (value.type) {
    case 'multiple-choice-exercise':
      return renderMultipleChoiceExercise({ value, path, setState })
    case 'text':
      return renderText({ value, path, setState })
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
      <ul>
        {map(solutions, (solution) => (
          <li key={solution.value.answer.value} {...dataTypes(solution)}>
            <input type="checkbox" />
            {render(get(solution, 'answer'))}
          </li>
        ))}
      </ul>
    </section>
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
  { value, path, setState }: StateValue<Array<E>>,
  callback: (value: StateValue<E>) => R,
): Array<R> {
  return value.map((item, index) =>
    callback({ value: item, path: [...path, index], setState }),
  )
}

function get<T, K extends keyof T & (string | number)>(
  { value, path, setState }: StateValue<T>,
  key: K,
): StateValue<T[K]> {
  return { value: value[key], path: [...path, key], setState }
}

interface StateValue<A> {
  value: A
  path: Path
  setState: React.Dispatch<React.SetStateAction<EditorState>>
}

interface Position {
  path: Path
  offset?: number
}

type Path = Array<string | number>

interface EditorState {
  content: MultipleChoiceExercise
  selection: Position | null
}

type Entity = MultipleChoiceExercise | Text

interface MultipleChoiceExercise {
  type: 'multiple-choice-exercise'
  title: Text
  solutions: Solution[]
}

interface Solution {
  answer: Text
  correct: boolean
}

interface Text {
  type: 'text'
  value: string
}
