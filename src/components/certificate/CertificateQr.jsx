import { QRCodeCanvas } from 'qrcode.react'

function CertificateQr({ value, canvasRef = null }) {
  return (
    <div className="certificate-qr">
      <QRCodeCanvas
        ref={canvasRef}
        value={value}
        size={150}
        marginSize={1}
        level="M"
        bgColor="#ffffff"
        fgColor="#0f172a"
      />
    </div>
  )
}

export default CertificateQr
