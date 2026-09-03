export function printThermalHtml(htmlContent: string) {
  if (typeof window === "undefined") return;

  try {
    const existingIframe = document.getElementById("noa-thermal-print-iframe");
    if (existingIframe) {
      existingIframe.remove();
    }

    const iframe = document.createElement("iframe");
    iframe.id = "noa-thermal-print-iframe";
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.style.visibility = "hidden";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(htmlContent);
      doc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (e) {
          console.warn("Iframe print invoke error:", e);
        }
      }, 300);
      return;
    }
  } catch (err) {
    console.warn("Iframe print error, attempting window.open fallback:", err);
  }

  // Fallback to window.open
  try {
    const printWindow = window.open("", "_blank", "width=380,height=650");
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 300);
    }
  } catch (e) {
    console.error("Window print error:", e);
  }
}
