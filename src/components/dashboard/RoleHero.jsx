function RoleHero({ label, title, description, badge }) {
  return (
    <section className="hero-card">
      <div className="hero-card__header">
        <p className="content__label">{label}</p>
        <span className="role-badge">{badge}</span>
      </div>
      <h1>{title}</h1>
      <p className="content__description">{description}</p>
    </section>
  )
}

export default RoleHero
