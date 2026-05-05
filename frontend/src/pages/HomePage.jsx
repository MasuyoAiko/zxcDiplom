import { Link } from 'react-router-dom'

function IconChart() {
  return (
    <svg className="home-icon" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        d="M4 19V5M8 19v-6M12 19V9M16 19v-9M20 19V12"
      />
    </svg>
  )
}

function IconLayers() {
  return (
    <svg className="home-icon" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        d="M12 4 4 8l8 4 8-4-8-4Zm-8 8 8 4 8-4M4 16l8 4 8-4"
      />
    </svg>
  )
}

function IconPulse() {
  return (
    <svg className="home-icon" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        d="M5 12h3l2-6 4 12 2-6h3"
      />
    </svg>
  )
}

function HomePage() {
  return (
    <div className="home-minimal">
      <section className="home-hero card card--lift">
        <h1 className="home-title">Population Lab</h1>
        <p className="home-tagline">Возрастная модель с памятью — расчёт и графики в браузере.</p>
        <Link className="home-cta" to="/simulator">
          Открыть симулятор
        </Link>
      </section>

      <ul className="home-tiles">
        <li className="home-tile card card--lift">
          <IconChart />
          <span>Динамика Σ и групп</span>
        </li>
        <li className="home-tile card card--lift">
          <IconLayers />
          <span>Структура по шагам</span>
        </li>
        <li className="home-tile card card--lift">
          <IconPulse />
          <span>Память в траектории</span>
        </li>
      </ul>
    </div>
  )
}

export default HomePage
