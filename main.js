pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

const container = document.getElementById("flipbook");
const url = "https://raw.githubusercontent.com/W3L33/files/main/archivo2.pdf";


pdfjsLib.getDocument(url).promise
  .then(async pdf => {
    const images = [];

    // Primero obtenemos la primera página para tomar el tamaño
    const firstPage = await pdf.getPage(1);
    const firstVp = firstPage.getViewport({ scale: 1.5 });
    const pageWidth = firstVp.width;
    const pageHeight = firstVp.height;

    // Crear hoja en blanco inicial con el mismo tamaño
    const blankCanvasStart = document.createElement("canvas");
    blankCanvasStart.width = pageWidth;
    blankCanvasStart.height = pageHeight;
    const ctxStart = blankCanvasStart.getContext("2d");
    ctxStart.fillStyle = "#ffffff";
    ctxStart.fillRect(0, 0, pageWidth, pageHeight);

    images.push(blankCanvasStart.toDataURL("image/jpeg"));

    // Ahora renderizamos todas las páginas del PDF
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const vp = page.getViewport({ scale: 1.5 });
      canvas.width = vp.width;
      canvas.height = vp.height;
      await page.render({ canvasContext: ctx, viewport: vp }).promise;
      images.push(canvas.toDataURL("image/jpeg"));
    }

    // Agregar hoja blanca al final solo si el PDF tiene número par de páginas
    if (pdf.numPages % 2 === 0) {
      const blankCanvasEnd = document.createElement("canvas");
      blankCanvasEnd.width = pageWidth;
      blankCanvasEnd.height = pageHeight;
      const ctxEnd = blankCanvasEnd.getContext("2d");
      ctxEnd.fillStyle = "#ffffff";
      ctxEnd.fillRect(0, 0, pageWidth, pageHeight);
      images.push(blankCanvasEnd.toDataURL("image/jpeg"));
    }

    // Crear flipbook
// =====================
// Crear flipbook dinámico según tamaño de página PDF
const aspectRatio = pageWidth / pageHeight; // ancho / alto

// Definir altura base que quieras para el flipbook
const baseHeight = 700; // por ejemplo
let flipWidth = baseHeight * aspectRatio;
let flipHeight = baseHeight;

// Si quieres limitar el tamaño máximo y mínimo:
flipWidth = Math.min(Math.max(flipWidth, 400), 1000);
flipHeight = Math.min(Math.max(flipHeight, 300), 800);

const pageFlip = new St.PageFlip(container, {
  width: flipWidth,
  height: flipHeight,
  size: "stretch",
  minWidth: 400,
  maxWidth: 1000,
  minHeight: 300,
  maxHeight: 800,
  drawShadow: true,
  showCover: false,
  backgroundColor: "#ffffff"
});


    pageFlip.loadFromImages(images);
    pageFlip.setCover(images.length - 1, true);

    // Navegación con flechas
    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") pageFlip.flipNext();
      if (e.key === "ArrowLeft") pageFlip.flipPrev();
    });

  })
  .catch(err => console.error("Error cargando PDF:", err));