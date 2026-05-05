import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import ChartsPanel from '../components/ChartsPanel'
import { ExplainHint } from '../components/ExplainHint'
import { EX } from '../content/explanations'
import { BUILTIN_PRESETS, DEFAULT_FORM } from '../data/simulationPresets'

const API_URL = 'http://127.0.0.1:8000/api/simulate/'
const STORAGE_LAST = 'population-lab-last-form'
const STORAGE_SAVED = 'population-lab-saved-configs'

const parseNumberArray = (text) =>
  text
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => Number(value))

function loadLastForm() {
  try {
    const raw = localStorage.getItem(STORAGE_LAST)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (!data || typeof data !== 'object') return null
    const keys = ['initial_population', 'fertility', 'survival', 'memory_weight', 'memory_depth', 'steps']
    if (!keys.every((k) => k in data)) return null
    return {
      initial_population: String(data.initial_population),
      fertility: String(data.fertility),
      survival: String(data.survival),
      memory_weight: Number(data.memory_weight),
      memory_depth: Number(data.memory_depth),
      steps: Number(data.steps),
    }
  } catch {
    return null
  }
}

function loadSavedList() {
  try {
    const raw = localStorage.getItem(STORAGE_SAVED)
    if (!raw) return []
    const list = JSON.parse(raw)
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

function persistLast(form) {
  try {
    localStorage.setItem(STORAGE_LAST, JSON.stringify(form))
  } catch {
    /* ignore */
  }
}

function persistSaved(list) {
  try {
    localStorage.setItem(STORAGE_SAVED, JSON.stringify(list))
  } catch {
    /* ignore */
  }
}

function SimulatorPage() {
  const initialForm = useMemo(() => loadLastForm() ?? { ...DEFAULT_FORM }, [])
  const [form, setForm] = useState(initialForm)
  const [presetValue, setPresetValue] = useState(() => (loadLastForm() ? 'custom' : 'builtin:standard'))
  const [savedConfigs, setSavedConfigs] = useState(() => loadSavedList())
  const [saveName, setSaveName] = useState('')
  const [result, setResult] = useState(null)
  const [simulationKey, setSimulationKey] = useState(0)
  const [chartType, setChartType] = useState('line')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const applyForm = useCallback((next) => {
    setForm({ ...next })
  }, [])

  const handlePresetChange = (event) => {
    const value = event.target.value
    setPresetValue(value)
    if (value.startsWith('builtin:')) {
      const id = value.replace('builtin:', '')
      const p = BUILTIN_PRESETS.find((x) => x.id === id)
      if (p) applyForm({ ...p.form })
      return
    }
    if (value.startsWith('saved:')) {
      const id = value.replace('saved:', '')
      const found = savedConfigs.find((x) => x.id === id)
      if (found) applyForm({ ...found.form })
    }
  }

  const handleSaveCustom = () => {
    const name = saveName.trim() || `Набор ${savedConfigs.length + 1}`
    const id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `s-${Date.now()}`
    const entry = { id, name, form: { ...form } }
    const next = [...savedConfigs, entry]
    setSavedConfigs(next)
    persistSaved(next)
    setPresetValue(`saved:${id}`)
    setSaveName('')
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setPresetValue('custom')
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSlider = (name, numeric) => {
    setPresetValue('custom')
    setForm((prev) => ({
      ...prev,
      [name]: numeric,
    }))
  }

  useEffect(() => {
    persistLast(form)
  }, [form])

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
      setSimulationKey((k) => k + 1)
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

  const builtinOptions = BUILTIN_PRESETS.map((p) => (
    <option key={p.id} value={`builtin:${p.id}`}>
      {p.name}
    </option>
  ))

  const savedOptions =
    savedConfigs.length > 0 ? (
      <optgroup label="Сохранённые наборы">
        {savedConfigs.map((s) => (
          <option key={s.id} value={`saved:${s.id}`}>
            {s.name}
          </option>
        ))}
      </optgroup>
    ) : null

  return (
    <>
      <section className="card card--lift animate-card">
        <h1 className="sim-h1">Симулятор</h1>
        <p className="hint sim-lead">
          Выберите готовый сценарий или подстройте ползунки. Векторы ниже можно не трогать, если достаточно пресета.
        </p>

        <div className="sim-toolbar">
          <label className="sim-select-label">
            Сценарий
            <select className="chart-selector sim-select" value={presetValue} onChange={handlePresetChange}>
              <option value="custom">Свой набор (текущие поля)</option>
              <optgroup label="Готовые сценарии">{builtinOptions}</optgroup>
              {savedOptions}
            </select>
          </label>
          <div className="sim-save-row">
            <input
              className="sim-save-input"
              placeholder="Имя для сохранения"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
            />
            <button type="button" className="btn-secondary" onClick={handleSaveCustom}>
              Сохранить набор
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="sim-form">
          <div className="slider-panel card-inner">
            <h2 className="sim-section-title">Параметры</h2>
            <label className="slider-field">
              <span>
                Вес памяти: <strong>{Number(form.memory_weight).toFixed(2)}</strong>
              </span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={form.memory_weight}
                onChange={(e) => handleSlider('memory_weight', Number(e.target.value))}
                className="slider-track"
              />
            </label>
            <label className="slider-field">
              <span>
                Глубина памяти: <strong>{form.memory_depth}</strong> шаг.
              </span>
              <input
                type="range"
                min={1}
                max={200}
                step={1}
                value={form.memory_depth}
                onChange={(e) => handleSlider('memory_depth', Number(e.target.value))}
                className="slider-track"
              />
            </label>
            <label className="slider-field">
              <span>
                Шагов модели: <strong>{form.steps}</strong>
              </span>
              <input
                type="range"
                min={1}
                max={500}
                step={1}
                value={form.steps}
                onChange={(e) => handleSlider('steps', Number(e.target.value))}
                className="slider-track"
              />
            </label>
          </div>

          <details className="vectors-details">
            <summary className="vectors-summary">Векторы (редактирование вручную)</summary>
            <div className="form-grid form-grid--vectors">
              <label>
                <span className="label-with-hint">
                  Начальная численность
                  <ExplainHint title={EX.initialPopulation}>{EX.initialPopulationBody}</ExplainHint>
                </span>
                <input
                  name="initial_population"
                  value={form.initial_population}
                  onChange={handleChange}
                  autoComplete="off"
                />
              </label>
              <label>
                <span className="label-with-hint">
                  Рождаемость по группам
                  <ExplainHint title={EX.fertility}>{EX.fertilityBody}</ExplainHint>
                </span>
                <input name="fertility" value={form.fertility} onChange={handleChange} autoComplete="off" />
              </label>
              <label>
                <span className="label-with-hint">
                  Выживаемость между группами
                  <ExplainHint title={EX.survival}>{EX.survivalBody}</ExplainHint>
                </span>
                <input name="survival" value={form.survival} onChange={handleChange} autoComplete="off" />
              </label>
            </div>
          </details>

          <div className="form-actions">
            <button type="submit" className="btn-pulse" disabled={loading}>
              {loading ? 'Расчет...' : 'Запустить модель'}
            </button>
          </div>
        </form>
        {error && <p className="error animate-fade">{error}</p>}
      </section>

      {result && (
        <ChartsPanel
          key={simulationKey}
          result={result}
          chartType={chartType}
          setChartType={setChartType}
        />
      )}
    </>
  )
}

export default SimulatorPage
