import { useRef } from 'react'
import { jsPDF } from 'jspdf'
import logo from '../assets/Logo.png'
import arialUnicodeFont from '../assets/fonts/ArialUnicode.ttf'
import CertificateQr from '../components/certificate/CertificateQr'

function loadImageData(url) {
  return fetch(url)
    .then((response) => response.blob())
    .then(
      (blob) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result)
          reader.onerror = reject
          reader.readAsDataURL(blob)
        }),
    )
}

let fontRegistrationPromise = null

function loadFontData(url) {
  return fetch(url)
    .then((response) => response.blob())
    .then(
      (blob) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => {
            const result = typeof reader.result === 'string' ? reader.result : ''
            resolve(result.split(',')[1] ?? '')
          }
          reader.onerror = reject
          reader.readAsDataURL(blob)
        }),
    )
}

function ensurePdfFont(pdf) {
  if (!fontRegistrationPromise) {
    fontRegistrationPromise = loadFontData(arialUnicodeFont)
  }

  return fontRegistrationPromise.then((fontData) => {
    if (!pdf.getFontList().ArialUnicode) {
      pdf.addFileToVFS('ArialUnicode.ttf', fontData)
      pdf.addFont('ArialUnicode.ttf', 'ArialUnicode', 'normal')
      pdf.addFont('ArialUnicode.ttf', 'ArialUnicode', 'bold')
    }
  })
}

function drawCenteredText(pdf, text, x, y, options = {}) {
  const {
    fontSize = 14,
    color = [15, 23, 42],
    isBold = false,
    lineHeightFactor = 1.15,
    maxWidth,
  } = options

  pdf.setFont('ArialUnicode', 'normal')
  pdf.setFontSize(fontSize)
  pdf.setTextColor(...color)

  const lines = maxWidth ? pdf.splitTextToSize(text, maxWidth) : text

  pdf.text(lines, x, y, {
    align: 'center',
    lineHeightFactor,
  })

  if (isBold) {
    pdf.text(lines, x + 0.35, y, {
      align: 'center',
      lineHeightFactor,
    })
  }

  return Array.isArray(lines) ? lines.length : 1
}

function CertificateCardContent({
  copy,
  course,
  session,
  certificateNumber,
  issuedDate,
  verifyUrl,
  onOpenCourse,
  qrCanvasRef = null,
}) {
  return (
    <>
      <div className="certificate-card__logo-wrap">
        <img className="certificate-card__logo" src={logo} alt="Arvand" />
      </div>
      <h1>{copy.certificate.title}</h1>
      <p className="certificate-card__lead">{copy.certificate.intro}</p>
      <p className="certificate-card__name">{session.name}</p>
      <p className="certificate-card__lead">{copy.certificate.programText}</p>
      <button
        type="button"
        className="certificate-card__course"
        onClick={() => onOpenCourse(course.id)}
      >
        {course.title[copy.languageKey]}
      </button>

      <div className="certificate-card__meta">
        <div>
          <p className="certificate-card__meta-label">{copy.certificate.dateLabel}</p>
          <p className="certificate-card__meta-value">{issuedDate}</p>
        </div>
        <div>
          <p className="certificate-card__meta-label">{copy.certificate.numberLabel}</p>
          <p className="certificate-card__meta-value">{certificateNumber}</p>
        </div>
      </div>

      <div className="certificate-card__verify">
        <div className="certificate-card__verify-box">
          <CertificateQr value={verifyUrl} canvasRef={qrCanvasRef} />
          <div className="certificate-card__verify-label">
            <p>{copy.certificate.verifyLabel}</p>
          </div>
        </div>
      </div>
    </>
  )
}

function CertificatePage({
  copy,
  course,
  session,
  certificateNumber,
  issuedDate,
  verifyUrl,
  onOpenCourse,
  onGoHome,
}) {
  const qrCanvasRef = useRef(null)

  const handleDownloadPdf = async () => {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    })
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const cardX = 58
    const cardY = 52
    const cardWidth = pageWidth - 116
    const cardHeight = pageHeight - 132
    const centerX = pageWidth / 2
    const qrSize = 122
    const qrBoxWidth = 182
    const qrBoxHeight = 214
    await ensurePdfFont(pdf)
    const logoData = await loadImageData(logo)
    const qrData = qrCanvasRef.current?.toDataURL('image/png')

    pdf.setFillColor(241, 253, 255)
    pdf.roundedRect(cardX, cardY, cardWidth, cardHeight, 24, 24, 'F')

    pdf.addImage(logoData, 'PNG', centerX - 94.5, cardY + 41, 189, 52)

    drawCenteredText(pdf, copy.certificate.title, centerX, cardY + 176, {
      fontSize: 32,
      color: [15, 23, 42],
      isBold: true,
      lineHeightFactor: 1,
    })

    drawCenteredText(pdf, copy.certificate.intro, centerX, cardY + 220, {
      fontSize: 14,
      color: [71, 85, 105],
    })

    drawCenteredText(pdf, session.name, centerX, cardY + 249, {
      fontSize: 14,
      color: [15, 23, 42],
      isBold: true,
    })

    drawCenteredText(pdf, copy.certificate.programText, centerX, cardY + 278, {
      fontSize: 14,
      color: [71, 85, 105],
    })

    const courseTitleLines = drawCenteredText(
      pdf,
      course.title[copy.languageKey],
      centerX,
      cardY + 318,
      {
        fontSize: 16,
        color: [8, 191, 208],
        isBold: true,
        lineHeightFactor: 1.3,
        maxWidth: cardWidth - 160,
      },
    )

    const courseTitleBottom = cardY + 318 + (courseTitleLines - 1) * 21
    const metaStartY = courseTitleBottom + 44

    drawCenteredText(pdf, `${copy.certificate.dateLabel} ${issuedDate}`, centerX, metaStartY, {
      fontSize: 13,
      color: [100, 116, 139],
    })
    drawCenteredText(
      pdf,
      `${copy.certificate.numberLabel} ${certificateNumber}`,
      centerX,
      metaStartY + 28,
      {
        fontSize: 13,
        color: [100, 116, 139],
      },
    )

    const qrBoxX = centerX - qrBoxWidth / 2
    const qrBoxY = metaStartY + 66

    pdf.setFillColor(255, 255, 255)
    pdf.roundedRect(qrBoxX, qrBoxY, qrBoxWidth, qrBoxHeight, 18, 18, 'F')

    if (qrData) {
      pdf.addImage(qrData, 'PNG', centerX - qrSize / 2, qrBoxY + 18, qrSize, qrSize)
    }

    pdf.setDrawColor(226, 232, 240)
    pdf.setLineWidth(1)
    pdf.line(qrBoxX + 16, qrBoxY + 160, qrBoxX + qrBoxWidth - 16, qrBoxY + 160)

    drawCenteredText(pdf, copy.certificate.verifyLabel, centerX, qrBoxY + 186, {
      fontSize: 12,
      color: [71, 85, 105],
    })

    pdf.save(`${course.id}-certificate.pdf`)
  }

  return (
    <section className="certificate-page">
      <div className="certificate-card">
        <CertificateCardContent
          copy={copy}
          course={course}
          session={session}
          certificateNumber={certificateNumber}
          issuedDate={issuedDate}
          verifyUrl={verifyUrl}
          onOpenCourse={onOpenCourse}
          qrCanvasRef={qrCanvasRef}
        />
      </div>

      <button
        type="button"
        className="certificate-download-button"
        onClick={handleDownloadPdf}
      >
        {copy.certificate.downloadPdf}
      </button>

      <div className="certificate-actions">
        <button
          type="button"
          className="certificate-action-button"
          onClick={() => onOpenCourse(course.id)}
        >
          {copy.certificate.openCourse}
        </button>
        <button
          type="button"
          className="certificate-action-button"
          onClick={onGoHome}
        >
          {copy.certificate.goHome}
        </button>
      </div>
    </section>
  )
}

export default CertificatePage
