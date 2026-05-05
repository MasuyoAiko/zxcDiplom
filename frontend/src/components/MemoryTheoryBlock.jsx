/**
 * Обязательное пояснение: что значит «память» в этой реализации.
 */
export function MemoryTheoryBlock() {
  return (
    <aside className="memory-theory card-inner">
      <h3 className="memory-theory-title">Что такое «память» здесь</h3>
      <p className="memory-theory-p">
        Перед шагом Лесли не состояние <em>x</em>(<em>t</em>) подставляется в рождаемость и выживаемость сразу, а{' '}
        <strong>эффективное</strong> состояние <strong>x̃</strong>: выпуклая смесь текущего вектора и «образа прошлого»
        с весом <strong>α</strong> ∈ [0, 1]:
      </p>
      <p className="memory-formula">x̃ = (1 − α) · x(t) + α · K[x](t),</p>
      <p className="memory-theory-p">
        где <strong>K</strong> — выбранное вами <strong>ядро памяти</strong>: равномерное среднее по окну (прямоугольное),
        экспоненциальное взвешивание недавних шагов («забывание»), либо фиксированное <strong>запаздывание τ</strong> —
        подстановка состояния с шага <em>t − τ</em>. При <strong>α = 0</strong> получается классическая дискретная модель
        Лесли <strong>без памяти</strong>.
      </p>
    </aside>
  )
}
