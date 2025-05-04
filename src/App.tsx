import '@picocss/pico/css/pico.min.css'
import './App.css'

export default function App() {
  return (
    <main className="content">
      <h1>Rsbuild with React</h1>
      <p>Start building amazing things with Rsbuild.</p>
    </main>
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
