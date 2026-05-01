import { useMemo, useState } from 'react'
import axios from 'axios'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import './App.css'

const API_URL = 'http://127.0.0.1:8000/api/simulate/'

const parseNumberArray = (text) =>
  text
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => Number(value))

function App() {
  const [form, setForm] = useState({
    initial_population: '120, 85, 50, 20',
    fertility: '0.0, 0.3, 0.7, 0.1',
    survival: '0.92, 0.88, 0.72',
    memory_weight: 0.25,
    memory_depth: 4,
    steps: 40,
  })
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const groupLabels = useMemo(() => {
    if (!result?.time_series?.length) {
      return []
    }
    return result.time_series[0].ages.map((_, idx) => `Возраст ${idx + 1}`)
  }, [result])

  const ageSeries = useMemo(() => {
    if (!result?.time_series) {
      return []
    }
    return result.time_series.map((point) => {
      const payload = { step: point.step }
      point.ages.forEach((value, idx) => {
        payload[`age${idx}`] = Number(value.toFixed(3))
      })
      return payload
    })
  }, [result])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const payload = {
        initial_population: parseNumberArray(form.initial_population),
        fertility: parseNumberArray(form.fertility),
        survival: parseNumberArray(form.survival),
        memory_weight: Number(form.memory_weight),
        memory_depth: Number(form.memory_depth),
        steps: Number(form.steps),
      }
      const response = await axios.post(API_URL, payload)
      setResult(response.data)
    } catch (requestError) {
      const details = requestError?.response?.data
      setError(
        typeof details === 'string'
          ? details
          : 'Ошибка расчета. Проверьте формат массивов и диапазоны параметров.',
      )
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="layout">
      <section className="card">
        <h1>Модель популяции с возрастом и памятью</h1>
        <p className="hint">
          Формат массивов: числа через запятую. Длины должны совпадать:
          `fertility = initial_population`, `survival = initial_population - 1`.
        </p>
        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            Начальная численность
            <input
              name="initial_population"
              value={form.initial_population}
              onChange={handleChange}
            />
          </label>
          <label>
            Рождаемость по группам
            <input name="fertility" value={form.fertility} onChange={handleChange} />
          </label>
          <label>
            Выживаемость между группами
            <input name="survival" value={form.survival} onChange={handleChange} />
          </label>
          <label>
            Вес памяти (0..1)
            <input
              name="memory_weight"
              type="number"
              min="0"
              max="1"
              step="0.01"
              value={form.memory_weight}
              onChange={handleChange}
            />
          </label>
          <label>
            Глубина памяти (шагов)
            <input
              name="memory_depth"
              type="number"
              min="1"
              max="200"
              value={form.memory_depth}
              onChange={handleChange}
            />
          </label>
          <label>
            Горизонт моделирования
            <input
              name="steps"
              type="number"
              min="1"
              max="500"
              value={form.steps}
              onChange={handleChange}
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? 'Расчет...' : 'Запустить модель'}
          </button>
        </form>
        {error && <p className="error">{error}</p>}
      </section>

      {result && (
        <>
          <section className="card">
            <h2>Общая численность</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={result.time_series}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="step" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#4f46e5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </section>
          <section className="card">
            <h2>Возрастные группы</h2>
            <ResponsiveContainer width="100%" height={340}>
              <LineChart data={ageSeries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="step" />
                <YAxis />
                <Tooltip />
                <Legend />
                {groupLabels.map((label, idx) => (
                  <Line
                    key={label}
                    type="monotone"
                    dataKey={`age${idx}`}
                    name={label}
                    dot={false}
                    stroke={`hsl(${(idx * 75) % 360}, 70%, 45%)`}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </section>
        </>
      )}
    </main>
  )
}

export default App
