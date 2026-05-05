import { Link } from 'react-router-dom'

function HomePage() {
  return (
    <div className="home-wrap home-landing">
      <section className="home-hero-mega card card--lift">
        <div className="home-hero-glow" aria-hidden />
        <div className="home-hero-inner">
          <p className="home-kicker">Population Lab · возрастная структура и память</p>
          <h1 className="home-headline">
            «Популяции помнят прошлое.
            <br />
            Узнайте, как это меняет их будущее»
          </h1>
          <p className="home-lead">
            Интерактивная модель динамики популяции с возрастной структурой и эффектом памяти. Сравните классику (Лесли)
            и модель с интегральным ядром памяти. Двигайте ползунки — графики меняются мгновенно.
          </p>
          <div className="home-cta-cluster">
            <Link className="btn-home-primary" to="/simulator">
              Попробовать сейчас
            </Link>
          </div>
        </div>
      </section>

      <div className="home-method-grid">
        <article className="card card--lift home-method-card">
          <span className="home-method-tag">Базовая линия</span>
          <h3 className="home-method-title">Модель Лесли</h3>
          <p className="home-method-text">
            Популяция разбивается на возрастные классы фиксированной длины. На каждом шаге времени новые особи появляются
            из рождаемости (первая строка матрицы), старшие классы переводятся с коэффициентами выживаемости. Так получается
            линейное дискретное отображение: вектор численностей умножается на одну и ту же матрицу Лесли на каждом шаге —
            память ограничена одним предыдущим состоянием.
          </p>
        </article>

        <article className="card card--lift home-method-card home-method-card--accent">
          <span className="home-method-tag home-method-tag--hot">Расширение</span>
          <h3 className="home-method-title">Память и интегральное ядро</h3>
          <p className="home-method-text">
            Вместо того чтобы брать только текущие коэффициенты, модель усредняет вклад нескольких прошлых шагов с весами,
            задаваемыми ядром (например, равномерное окно, экспоненциальное затухание или ответ с явным запаздыванием).
            Параметры «глубины», интенсивности α и типа ядра задают, насколько долго и как именно прошлое тянет за собой
            будущую численность — это видно на суммарной траектории N(t) и на распределении по группам.
          </p>
        </article>

        <article className="card card--lift home-method-card">
          <span className="home-method-tag">На экране</span>
          <h3 className="home-method-title">Что сравнивается</h3>
          <p className="home-method-text">
            После расчёта можно включить наложение «классики»: та же начальная структура и базовые вектора рождаемости и
            выживаемости, но без памяти — как стандартная Лесли. Ползунки окна по времени и тип линий помогают читать и
            долгосрочный тренд, и локальные колебания; пирамида и доли групп показывают состав на правом краю этого окна;
            доступны также фазовая плоскость по видимому отрезку и круговая диаграмма долей.
          </p>
        </article>
      </div>

      <section className="card card--lift home-steps-card">
        <h2 className="home-steps-title">Как пользоваться за три шага</h2>
        <ol className="home-steps">
          <li>
            <span className="home-step-num">1</span>
            <div>
              <strong>Сценарий и ядро</strong>
              <p>Выберите пресет или свой набор: тип памяти, интенсивность, глубина окна, горизонт моделирования.</p>
            </div>
          </li>
          <li>
            <span className="home-step-num">2</span>
            <div>
              <strong>Графики в реальном времени</strong>
              <p>
                N(t), возрастные группы, пирамида и доли по правому краю окна времени, фазовый портрет — всё обновляется при
                изменении входных данных.
              </p>
            </div>
          </li>
          <li>
            <span className="home-step-num">3</span>
            <div>
              <strong>Снимок и сохранённые прогоны</strong>
              <p>
                Внизу панели графиков можно скачать один длинный PNG со всеми блоками; понравившиеся расчёты сохраняются в
                браузере для повторной загрузки в симуляторе.
              </p>
            </div>
          </li>
        </ol>
      </section>
    </div>
  )
}

export default HomePage
