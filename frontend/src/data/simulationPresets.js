/** Встроенные сценарии: полное состояние формы симулятора */

export const DEFAULT_FORM = {
  initial_population: '120, 85, 50, 20',
  fertility: '0.0, 0.3, 0.7, 0.1',
  survival: '0.92, 0.88, 0.72',
  memory_weight: 0.25,
  memory_depth: 4,
  steps: 40,
}

export const BUILTIN_PRESETS = [
  {
    id: 'standard',
    name: 'Стандарт',
    description: 'Баланс рождаемости и памяти',
    form: { ...DEFAULT_FORM },
  },
  {
    id: 'high-fertility',
    name: 'Высокая рождаемость',
    description: 'Сильнее приток в первую группу',
    form: {
      initial_population: '80, 70, 45, 30',
      fertility: '0.05, 0.45, 0.85, 0.15',
      survival: '0.9, 0.85, 0.7',
      memory_weight: 0.15,
      memory_depth: 3,
      steps: 50,
    },
  },
  {
    id: 'strong-memory',
    name: 'Сильная память',
    description: 'Большой вес среднего по истории',
    form: {
      initial_population: '100, 90, 60, 25',
      fertility: '0.0, 0.25, 0.65, 0.12',
      survival: '0.91, 0.87, 0.74',
      memory_weight: 0.65,
      memory_depth: 10,
      steps: 45,
    },
  },
  {
    id: 'short-run',
    name: 'Короткий горизонт',
    description: 'Мало шагов, лёгкая проверка',
    form: {
      initial_population: '50, 40, 30, 15',
      fertility: '0.0, 0.35, 0.6, 0.08',
      survival: '0.93, 0.89, 0.75',
      memory_weight: 0.3,
      memory_depth: 5,
      steps: 18,
    },
  },
  {
    id: 'low-survival',
    name: 'Ниже выживаемость',
    description: 'Быстрее «вымывание» старших групп',
    form: {
      initial_population: '200, 100, 40, 10',
      fertility: '0.0, 0.28, 0.55, 0.1',
      survival: '0.75, 0.7, 0.55',
      memory_weight: 0.2,
      memory_depth: 4,
      steps: 60,
    },
  },
]
