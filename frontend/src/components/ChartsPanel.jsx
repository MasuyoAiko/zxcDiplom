import { useEffect, useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

function useChartGridStroke() {
  const [stroke, setStroke] = useState('#cbd5e1')
  useEffect(() => {
    const sync = () => {
      setStroke(document.documentElement.dataset.theme === 'dark' ? '#4c5168' : '#cbd5e1')
    }
    sync()
    const mo = new MutationObserver(sync)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => mo.disconnect()
  }, [])
  return stroke
}

const colorForIndex = (idx) => `hsl(${(idx * 75) % 360}, 72%, 46%)`

function buildDataset(result) {
  if (!result?.time_series?.length) {
    return { rows: [], labels: [], maxStep: 0 }
  }
  const labels = result.time_series[0].ages.map((_, idx) => `Возраст ${idx + 1}`)
  const rows = result.time_series.map((point) => {
    const rawSum = point.ages.reduce((a, b) => a + b, 0)
    const row = {
      step: point.step,
      total: Number(point.total.toFixed(6)),
      _sum: rawSum,
    }
    point.ages.forEach((v, idx) => {
      const n = Number(v)
      row[`age${idx}`] = Number(n.toFixed(6))
      row[`share${idx}`] = rawSum > 0 ? Number((n / rawSum).toFixed(6)) : 0
    })
    return row
  })
  const maxStep = rows[rows.length - 1].step
  return { rows, labels, maxStep }
}

function TotalChart({ chartType, data, gridStroke }) {
  if (!data.length) return null

  if (chartType === 'composed') {
    return (
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
        <XAxis dataKey="step" tick={{ fontSize: 12 }} />
        <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
        <Tooltip contentStyle={{ borderRadius: 12 }} />
        <Legend />
        <Bar yAxisId="right" dataKey="age0" name="Первая группа (новорожд.)" fill="#a78bfa" radius={[6, 6, 0, 0]} />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="total"
          name="Σ численность"
          stroke="#4f46e5"
          dot={false}
          strokeWidth={2}
        />
      </ComposedChart>
    )
  }

  if (chartType === 'area') {
    return (
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
        <XAxis dataKey="step" />
        <YAxis />
        <Tooltip contentStyle={{ borderRadius: 12 }} />
        <Area type="monotone" dataKey="total" stroke="#4f46e5" fill="#a5b4fc" fillOpacity={0.35} />
      </AreaChart>
    )
  }

  if (chartType === 'bar') {
    return (
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
        <XAxis dataKey="step" />
        <YAxis />
        <Tooltip contentStyle={{ borderRadius: 12 }} />
        <Bar dataKey="total" fill="#7c3aed" radius={[6, 6, 0, 0]} name="Σ численность" />
      </BarChart>
    )
  }

  return (
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
      <XAxis dataKey="step" />
      <YAxis />
      <Tooltip contentStyle={{ borderRadius: 12 }} />
      <Line type="monotone" dataKey="total" stroke="#4f46e5" dot={false} strokeWidth={2} name="Σ численность" />
    </LineChart>
  )
}

function GroupsChart({ chartType, data, labels, gridStroke }) {
  if (!data.length) return null

  if (chartType === 'normalized') {
    return (
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
        <XAxis dataKey="step" />
        <YAxis domain={[0, 1]} tickFormatter={(v) => `${Math.round(v * 100)}%`} />
        <Tooltip
          formatter={(value) => `${(Number(value) * 100).toFixed(1)}%`}
          contentStyle={{ borderRadius: 12 }}
        />
        <Legend />
        {labels.map((label, idx) => (
          <Area
            key={label}
            type="monotone"
            dataKey={`share${idx}`}
            name={label}
            stackId="shares"
            stroke={colorForIndex(idx)}
            fill={colorForIndex(idx)}
            fillOpacity={0.35}
          />
        ))}
      </AreaChart>
    )
  }

  if (chartType === 'composed') {
    return (
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
        <XAxis dataKey="step" />
        <YAxis />
        <Tooltip contentStyle={{ borderRadius: 12 }} />
        <Legend />
        {labels.map((label, idx) => (
          <Line
            key={label}
            type="monotone"
            dataKey={`age${idx}`}
            name={label}
            dot={false}
            stroke={colorForIndex(idx)}
            strokeWidth={2}
          />
        ))}
      </LineChart>
    )
  }

  if (chartType === 'area') {
    return (
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
        <XAxis dataKey="step" />
        <YAxis />
        <Tooltip contentStyle={{ borderRadius: 12 }} />
        <Legend />
        {labels.map((label, idx) => (
          <Area
            key={label}
            type="monotone"
            dataKey={`age${idx}`}
            name={label}
            stroke={colorForIndex(idx)}
            fill={colorForIndex(idx)}
            fillOpacity={0.22}
          />
        ))}
      </AreaChart>
    )
  }

  if (chartType === 'bar') {
    return (
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
        <XAxis dataKey="step" />
        <YAxis />
        <Tooltip contentStyle={{ borderRadius: 12 }} />
        <Legend />
        {labels.map((label, idx) => (
          <Bar key={label} dataKey={`age${idx}`} name={label} fill={colorForIndex(idx)} />
        ))}
      </BarChart>
    )
  }

  return (
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
      <XAxis dataKey="step" />
      <YAxis />
      <Tooltip contentStyle={{ borderRadius: 12 }} />
      <Legend />
      {labels.map((label, idx) => (
        <Line
          key={label}
          type="monotone"
          dataKey={`age${idx}`}
          name={label}
          dot={false}
          stroke={colorForIndex(idx)}
          strokeWidth={2}
        />
      ))}
    </LineChart>
  )
}

function PhaseChart({ data, gridStroke }) {
  if (!data.length) return <p className="chart-empty">Недостаточно точек для фазовой плоскости.</p>
  return (
    <ScatterChart>
      <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
      <XAxis type="number" dataKey="n_t" name="N(t)" tick={{ fontSize: 12 }} />
      <YAxis type="number" dataKey="n_t1" name="N(t+1)" tick={{ fontSize: 12 }} />
      <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: 12 }} />
      <Scatter name="Траектория" data={data} fill="#ec4899">
        {data.map((_, i) => (
          <Cell key={`cell-${i}`} fill={`hsl(${(i * 22) % 360}, 70%, 52%)`} />
        ))}
      </Scatter>
    </ScatterChart>
  )
}

function ChartsPanel({ result, chartType, setChartType }) {
  const gridStroke = useChartGridStroke()
  const { rows, labels, maxStep } = useMemo(() => buildDataset(result), [result])
  const [winStart, setWinStart] = useState(0)
  const [winEnd, setWinEnd] = useState(maxStep)
  const [sliceStep, setSliceStep] = useState(maxStep)

  const visibleRows = useMemo(() => {
    return rows.filter((r) => r.step >= winStart && r.step <= winEnd)
  }, [rows, winStart, winEnd])

  const phaseData = useMemo(() => {
    const totals = visibleRows.map((r) => r.total)
    if (totals.length < 2) return []
    return totals.slice(0, -1).map((n_t, i) => ({
      n_t: Number(n_t.toFixed(4)),
      n_t1: Number(totals[i + 1].toFixed(4)),
    }))
  }, [visibleRows])

  const pieRows = useMemo(() => {
    const row = rows.find((r) => r.step === sliceStep) ?? rows[rows.length - 1]
    if (!row) return []
    return labels.map((name, idx) => ({
      name,
      value: Math.max(0, row[`age${idx}`] ?? 0),
    }))
  }, [rows, labels, sliceStep])

  const sliceSummary = useMemo(() => {
    const row = rows.find((r) => r.step === sliceStep)
    if (!row) return null
    const sum = row._sum ?? labels.reduce((acc, _, idx) => acc + (row[`age${idx}`] ?? 0), 0)
    return { total: row.total, sum }
  }, [rows, labels, sliceStep])

  const totalChartMode = chartType === 'normalized' ? 'line' : chartType === 'composed' ? 'composed' : chartType
  const groupsChartMode = chartType === 'composed' ? 'line' : chartType

  return (
    <>
      <section className="card card--lift animate-card">
        <div className="panel-head">
          <h2 className="chart-section-title">Визуализация и окно времени</h2>
        </div>

        <div className="controls-grid">
          <label className="control-block">
            <span className="control-label">Тип графиков</span>
            <select
              value={chartType}
              onChange={(event) => setChartType(event.target.value)}
              className="chart-selector"
            >
              <option value="line">Линейный</option>
              <option value="area">Областной</option>
              <option value="bar">Столбчатый</option>
              <option value="composed">Смешанный (Σ + группа 1)</option>
              <option value="normalized">Доли групп (100%)</option>
            </select>
          </label>

          <div className="control-block">
            <span className="control-label">Окно по шагам: {winStart} — {winEnd}</span>
            <div className="range-row">
              <label className="range-inline">
                От
                <input
                  type="range"
                  min={0}
                  max={Math.max(0, winEnd)}
                  value={winStart}
                  onChange={(e) => {
                    const v = Number(e.target.value)
                    setWinStart(Math.min(v, winEnd))
                  }}
                  className="slider-track"
                />
              </label>
              <label className="range-inline">
                До
                <input
                  type="range"
                  min={winStart}
                  max={maxStep}
                  value={winEnd}
                  onChange={(e) => {
                    const v = Number(e.target.value)
                    setWinEnd(Math.max(v, winStart))
                  }}
                  className="slider-track"
                />
              </label>
            </div>
          </div>

          <div className="control-block">
            <span className="control-label">Шаг для круговой диаграммы: {sliceStep}</span>
            <input
              type="range"
              min={0}
              max={maxStep}
              value={sliceStep}
              onChange={(e) => setSliceStep(Number(e.target.value))}
              className="slider-track slider-track--wide"
            />
          </div>
        </div>

        {chartType === 'normalized' && (
          <p className="chart-note animate-fade">
            Режим «доли групп» применён к блоку возрастных классов; суммарная численность ниже по-прежнему в абсолютных единицах.
          </p>
        )}
      </section>

      <section className="card card--lift animate-card chart-card">
        <h2 className="chart-section-title">Общая численность</h2>
        <div className="chart-surface animate-chart">
          <ResponsiveContainer width="100%" height={300}>
            <TotalChart chartType={totalChartMode} data={visibleRows} gridStroke={gridStroke} />
          </ResponsiveContainer>
        </div>
      </section>

      <section className="card card--lift animate-card chart-card">
        <h2 className="chart-section-title">Возрастные группы</h2>
        <div className="chart-surface animate-chart">
          <ResponsiveContainer width="100%" height={380}>
            <GroupsChart
              chartType={groupsChartMode}
              data={visibleRows}
              labels={labels}
              gridStroke={gridStroke}
            />
          </ResponsiveContainer>
        </div>
      </section>

      <section className="card card--lift animate-card chart-card">
        <h2 className="chart-section-title">Фазовая плоскость N(t) ↔ N(t+1)</h2>
        <div className="chart-surface animate-chart">
          <ResponsiveContainer width="100%" height={320}>
            <PhaseChart data={phaseData} gridStroke={gridStroke} />
          </ResponsiveContainer>
        </div>
      </section>

      <section className="card card--lift animate-card chart-card">
        <h2 className="chart-section-title">Структура на выбранном шаге</h2>
        {sliceSummary && (
          <p className="slice-summary animate-fade">
            Шаг {sliceStep}: Σ = {sliceSummary.total.toFixed(3)} · проверка суммы групп = {sliceSummary.sum.toFixed(3)}
          </p>
        )}
        <div className="pie-row">
          <div className="chart-surface pie-chart animate-chart">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={pieRows}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={108}
                  paddingAngle={2}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {pieRows.map((_, idx) => (
                    <Cell key={`slice-${idx}`} fill={colorForIndex(idx)} stroke="#fff" strokeWidth={1} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => v.toFixed(3)} contentStyle={{ borderRadius: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="share-table animate-fade">
            <table>
              <thead>
                <tr>
                  <th>Группа</th>
                  <th>Численность</th>
                  <th>Доля</th>
                </tr>
              </thead>
              <tbody>
                {pieRows.map((row, idx) => {
                  const total = pieRows.reduce((a, b) => a + b.value, 0)
                  const share = total > 0 ? row.value / total : 0
                  return (
                    <tr key={row.name}>
                      <td>
                        <span className="share-dot" style={{ background: colorForIndex(idx) }} />
                        {row.name}
                      </td>
                      <td>{row.value.toFixed(3)}</td>
                      <td>{(share * 100).toFixed(1)}%</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  )
}

export default ChartsPanel
