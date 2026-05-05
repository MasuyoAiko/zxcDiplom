import axios from 'axios'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ChartsPanel from '../components/ChartsPanel'
import { ExplainHint } from '../components/ExplainHint'
import { MemoryTheoryBlock } from '../components/MemoryTheoryBlock'
import { EX } from '../content/explanations'
import { BUILTIN_PRESETS, DEFAULT_FORM } from '../data/simulationPresets'

const API_URL = 'http://127.0.0.1:8000/api/simulate/'
const STORAGE_LAST = 'population-lab-last-form'
const STORAGE_RESULTS = 'population-lab-saved-results'
const MAX_SAVED_RESULTS = 24

const parseNumberArray = (text) =>
  text
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => Number(value))

function normalizeStored(raw) {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_FORM }
  return { ...DEFAULT_FORM, ...raw }
}

function loadLastForm() {
  try {
    const raw = localStorage.getItem(STORAGE_LAST)
    if (!raw) return null
    const data = JSON.parse(raw)
    return normalizeStored(data)
  } catch {
    return null
  }
}

function loadSavedResults() {
  try {
    const raw = localStorage.getItem(STORAGE_RESULTS)
    if (!raw) return []
    const list = JSON.parse(raw)
    if (!Array.isArray(list)) return []
    return list.filter(
      (x) =>
        x &&
        typeof x === 'object' &&
        x.id &&
        x.result &&
        x.result.time_series &&
        Array.isArray(x.result.time_series),
    )
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

function persistResults(list) {
  try {
    localStorage.setItem(STORAGE_RESULTS, JSON.stringify(list.slice(0, MAX_SAVED_RESULTS)))
  } catch {
    /* ignore */
  }
}

function SimulatorPage() {
  const initialForm = useMemo(() => loadLastForm() ?? { ...DEFAULT_FORM }, [])
  const [form, setForm] = useState(initialForm)
  const [activePresetId, setActivePresetId] = useState(() => (loadLastForm() ? 'custom' : 'standard'))
  const [savedRuns, setSavedRuns] = useState(() => loadSavedResults())
  const [resultSaveName, setResultSaveName] = useState('')
  const [result, setResult] = useState(null)
  const [simulationKey, setSimulationKey] = useState(0)
  const [chartType, setChartType] = useState('line')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const abortRef = useRef(null)

  const applyForm = useCallback((next) => {
    setForm(normalizeStored(next))
  }, [])

  const selectPreset = (presetId) => {
    const p = BUILTIN_PRESETS.find((x) => x.id === presetId)
    if (!p) return
    setActivePresetId(presetId)
    applyForm({ ...DEFAULT_FORM, ...p.form })
  }

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setActivePresetId('custom')
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSlider = (name, numeric) => {
    setActivePresetId('custom')
    setForm((prev) => ({
      ...prev,
      [name]: numeric,
    }))
  }

  const resetLeslieClassic = () => {
    setActivePresetId('custom')
    setForm((prev) => ({ ...prev, memory_weight: 0 }))
  }

  useEffect(() => {
    persistLast(form)
  }, [form])

  const buildPayload = useCallback(() => {
    return {
      initial_population: parseNumberArray(form.initial_population),
      fertility: parseNumberArray(form.fertility),
      survival: parseNumberArray(form.survival),
      memory_weight: Number(form.memory_weight),
      memory_depth: Number(form.memory_depth),
      steps: Number(form.steps),
      memory_kernel: form.memory_kernel,
      memory_gamma: Number(form.memory_gamma),
      memory_lag: Number(form.memory_lag),
      include_classic_comparison: Boolean(form.include_classic_comparison),
    }
  }, [form])

  const runSimulation = useCallback(async () => {
    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl
    setLoading(true)
    setError('')
    try {
      const payload = buildPayload()
      const response = await axios.post(API_URL, payload, { signal: ctrl.signal })
      setResult(response.data)
      setSimulationKey((k) => k + 1)
    } catch (requestError) {
      if (requestError?.code === 'ERR_CANCELED' || requestError?.name === 'CanceledError') return
      const details = requestError?.response?.data
      setError(
        typeof details === 'string'
          ? details
          : requestError?.message === 'Network Error'
            ? 'Нет связи с сервером (запустите backend на 127.0.0.1:8000).'
            : 'Ошибка расчета. Проверьте формат массивов и ограничения (глубина ≤ шагов и т.д.).',
      )
      setResult(null)
    } finally {
      setLoading(false)
    }
  }, [buildPayload])

  const formSignature = useMemo(() => {
    const copy = { ...form }
    delete copy.auto_recalculate
    return JSON.stringify(copy)
  }, [form])

  useEffect(() => {
    if (!form.auto_recalculate) return undefined
    const id = window.setTimeout(() => {
      void runSimulation()
    }, 450)
    return () => window.clearTimeout(id)
  }, [formSignature, form.auto_recalculate, runSimulation])

  const handleSubmit = (event) => {
    event.preventDefault()
    void runSimulation()
  }

  const handleSaveResult = () => {
    if (!result?.time_series?.length) return
    const name =
      resultSaveName.trim() ||
      `Расчёт ${new Date().toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })}`
    const id =
      typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `r-${Date.now()}`
    const entry = {
      id,
      name,
      savedAt: new Date().toISOString(),
      result: JSON.parse(JSON.stringify(result)),
      form: { ...form },
    }
    const next = [entry, ...savedRuns.filter((x) => x.id !== id)].slice(0, MAX_SAVED_RESULTS)
    setSavedRuns(next)
    persistResults(next)
    setResultSaveName('')
  }

  const handleLoadResult = (entry) => {
    setResult(entry.result)
    setForm(normalizeStored(entry.form))
    setSimulationKey((k) => k + 1)
    setActivePresetId('custom')
  }

  const handleDeleteResult = (id) => {
    const next = savedRuns.filter((x) => x.id !== id)
    setSavedRuns(next)
    persistResults(next)
  }

  const lastTotal = (r) => {
    if (!r?.totals?.length) return '—'
    return Number(r.totals[r.totals.length - 1]).toFixed(1)
  }

  const showStressWarning = Number(form.memory_weight) > 0.5 && Number(form.memory_depth) > 35

  const kernel = form.memory_kernel

  return (
    <>
      <section className="card card--lift animate-card sim-page-card">
        <h1 className="sim-h1">Симулятор</h1>
        <MemoryTheoryBlock />

        <label className="checkbox-row">
          <input
            type="checkbox"
            name="include_classic_comparison"
            checked={Boolean(form.include_classic_comparison)}
            onChange={handleChange}
          />
          <span>Показать на графике Σ(t) сравнение с классикой Лесли (α = 0, тот же прогон без памяти)</span>
        </label>

        {showStressWarning && (
          <div className="memory-warning" role="note">
            При сильной памяти (большой α и глубина) траектория может вести себя неинтуитивно или давать численные
            артефакты. Уменьшите α или глубину, либо отключите память кнопкой «Классика Лесли».
          </div>
        )}

        <div className="preset-section">
          <h2 className="preset-heading">Сценарии</h2>
          <div className="preset-grid">
            {BUILTIN_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`preset-card ${activePresetId === p.id ? 'preset-card--active' : ''}`}
                onClick={() => selectPreset(p.id)}
              >
                <span className="preset-card-title">{p.name}</span>
                <span className="preset-card-desc">{p.description}</span>
              </button>
            ))}
            <button
              type="button"
              className={`preset-card preset-card--custom ${activePresetId === 'custom' ? 'preset-card--active' : ''}`}
              onClick={() => setActivePresetId('custom')}
            >
              <span className="preset-card-title">Свой набор</span>
              <span className="preset-card-desc">Ползунки и векторы вручную</span>
            </button>
          </div>
        </div>

        {savedRuns.length > 0 && (
          <div className="saved-results-section">
            <h2 className="preset-heading">Сохранённые расчёты</h2>
            <p className="saved-results-hint">
              Параметры и полный ответ сервера сохранены в браузере — можно снова открыть тот же расчёт и построить графики.
            </p>
            <ul className="saved-results-list">
              {savedRuns.map((run) => (
                <li key={run.id} className="saved-result-row">
                  <div className="saved-result-meta">
                    <span className="saved-result-name">{run.name}</span>
                    <span className="saved-result-sub">
                      {new Date(run.savedAt).toLocaleString('ru-RU')} · N<sub>fin</sub> ≈ {lastTotal(run.result)}
                    </span>
                  </div>
                  <div className="saved-result-actions">
                    <button type="button" className="btn-secondary btn-compact" onClick={() => handleLoadResult(run)}>
                      Загрузить
                    </button>
                    <button
                      type="button"
                      className="btn-danger btn-compact"
                      onClick={() => handleDeleteResult(run.id)}
                    >
                      Удалить
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="sim-form">
          <div className="kernel-panel card-inner">
            <h2 className="sim-section-title">Ядро памяти</h2>
            <div className="kernel-grid">
              <label className="kernel-field">
                Тип
                <select
                  name="memory_kernel"
                  className="chart-selector kernel-select"
                  value={form.memory_kernel}
                  onChange={handleChange}
                >
                  <option value="rectangular">Прямоугольное (равномерное среднее по окну)</option>
                  <option value="exponential">Экспоненциальное («забывание» недавнего)</option>
                  <option value="lag">Запаздывание (состояние с шага t − τ)</option>
                </select>
              </label>
              {kernel === 'exponential' && (
                <label className="slider-field">
                  <span className="slider-label-row">
                    Жёсткость затухания γ <strong>{Number(form.memory_gamma).toFixed(2)}</strong>
                  </span>
                  <input
                    type="range"
                    min={0.05}
                    max={8}
                    step={0.05}
                    value={form.memory_gamma}
                    onChange={(e) => handleSlider('memory_gamma', Number(e.target.value))}
                    className="slider-track"
                  />
                </label>
              )}
              {kernel === 'lag' && (
                <label className="slider-field">
                  <span className="slider-label-row">
                    Запаздывание τ (шагов) <strong>{form.memory_lag}</strong>
                  </span>
                  <input
                    type="range"
                    min={1}
                    max={Math.min(200, Number(form.steps))}
                    step={1}
                    value={Math.min(Number(form.memory_lag), Number(form.steps))}
                    onChange={(e) => handleSlider('memory_lag', Number(e.target.value))}
                    className="slider-track"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="slider-panel">
            <h2 className="sim-section-title">Параметры</h2>
            <div className="slider-stack">
              <label className="slider-field">
                <span className="slider-label-row">
                  Сила памяти α <strong>{Number(form.memory_weight).toFixed(2)}</strong>
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
                <span className="slider-label-row">
                  Глубина окна памяти <strong>{form.memory_depth}</strong> (не больше числа шагов)
                </span>
                <input
                  type="range"
                  min={1}
                  max={Math.min(200, Number(form.steps))}
                  step={1}
                  value={Math.min(Number(form.memory_depth), Number(form.steps))}
                  onChange={(e) => handleSlider('memory_depth', Number(e.target.value))}
                  className="slider-track"
                />
              </label>
              <label className="slider-field">
                <span className="slider-label-row">
                  Шагов модели <strong>{form.steps}</strong> (ось времени — дискретные шаги t)
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
          </div>

          <label className="checkbox-row">
            <input
              type="checkbox"
              name="auto_recalculate"
              checked={Boolean(form.auto_recalculate)}
              onChange={handleChange}
            />
            <span>
              Автопересчёт при изменении параметров (debounce ~0,45 с; отмена предыдущего запроса). Выключите при правке
              векторов вручную, чтобы не дергать API на каждый символ.
            </span>
          </label>

          <details className="vectors-details">
            <summary className="vectors-summary">Векторы (рождаемость, выживаемость, начало)</summary>
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

          <div className="form-actions form-actions--split">
            <button type="submit" className="btn-pulse" disabled={loading}>
              {loading ? 'Расчет...' : 'Запустить сейчас'}
            </button>
            <button type="button" className="btn-secondary" onClick={resetLeslieClassic}>
              Классика Лесли (α = 0)
            </button>
          </div>
        </form>
        {error && <p className="error animate-fade">{error}</p>}

        {result && (
          <div className="save-result-bar">
            <input
              className="save-result-input"
              placeholder="Название для сохранения результата"
              value={resultSaveName}
              onChange={(e) => setResultSaveName(e.target.value)}
            />
            <button type="button" className="btn-secondary" onClick={handleSaveResult}>
              Сохранить результат расчёта
            </button>
          </div>
        )}
      </section>

      {result && (
        <ChartsPanel key={simulationKey} result={result} chartType={chartType} setChartType={setChartType} />
      )}
    </>
  )
}

export default SimulatorPage
