# Модель динамики популяции (Django + React)

Веб-приложение для моделирования популяции с:
- возрастной структурой;
- эффектом памяти (вклад прошлых состояний в текущую динамику);
- визуализацией общей численности и возрастных групп.

## Стек
- Backend: `Django`, `Django REST Framework`, `django-cors-headers`
- Frontend: `React` + `Vite`, `axios`, `recharts`

## Запуск backend
```bash
python -m pip install -r requirements.txt
cd backend
python manage.py migrate
python manage.py runserver
```

API: `POST http://127.0.0.1:8000/api/simulate/`

## Запуск frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`

## Формат входных параметров
- `initial_population`: массив численностей по возрастным группам
- `fertility`: массив коэффициентов рождаемости (той же длины)
- `survival`: массив выживаемости между соседними группами (длина `n - 1`)
- `memory_weight`: вес памяти `[0..1]`
- `memory_depth`: глубина памяти (количество шагов)
- `steps`: горизонт моделирования