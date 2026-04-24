function Footer({ copy }) {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer__inner">
        <p>{copy.footerLineOne}</p>
        <p>
          © {year} {copy.footerLineTwo}
        </p>
      </div>
    </footer>
  )
}

export default Footer
