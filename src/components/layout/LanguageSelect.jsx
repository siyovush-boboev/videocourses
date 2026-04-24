import { useRef, useState } from 'react'
import ChevronIcon from '../icons/ChevronIcon'
import useClickOutside from '../../hooks/useClickOutside'

function LanguageSelect({ copy, language, setLanguage }) {
  const [isOpen, setIsOpen] = useState(false)
  const rootRef = useRef(null)

  useClickOutside(rootRef, () => setIsOpen(false), isOpen)

  return (
    <div ref={rootRef} className="language-select">
      <button
        type="button"
        className="language-select__trigger"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={copy.languageLabel}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className={`flag-dot flag-dot--${language}`} aria-hidden="true"></span>
        <span>{copy.languages[language].short}</span>
        <ChevronIcon />
      </button>

      {isOpen ? (
        <div className="language-select__menu" role="listbox">
          {Object.entries(copy.languages).map(([key, value]) => (
            <button
              key={key}
              type="button"
              className={
                language === key ? 'language-option is-active' : 'language-option'
              }
              onClick={() => {
                setLanguage(key)
                setIsOpen(false)
              }}
            >
              <span className={`flag-dot flag-dot--${key}`} aria-hidden="true"></span>
              <span>{value.name}</span>
              <span className="language-option__short">{value.short}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default LanguageSelect
