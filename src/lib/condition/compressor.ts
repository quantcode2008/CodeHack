/**
 * Client-Side Image Compression & Condition Photo Utilities
 * Compresses camera uploads from mobile devices down to lightweight WebP/JPEG payloads (< 250KB)
 * using HTML5 Canvas before uploading or persisting in local ledger.
 */

export interface CompressedPhotoResult {
  dataUrl: string;
  sizeKb: number;
  width: number;
  height: number;
  filename: string;
  timestamp: string;
}

/**
 * Compresses an image file client-side using an offscreen canvas
 */
export async function compressImage(
  file: File,
  maxWidth = 1280,
  maxHeight = 1280,
  quality = 0.78
): Promise<CompressedPhotoResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to load image object"));
      img.onload = () => {
        let { width, height } = img;

        // Calculate aspect-preserving dimensions
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Failed to obtain canvas context"));
          return;
        }

        // Clean white background in case of transparent png
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Export as WebP if supported, fallback to JPEG
        let dataUrl: string;
        try {
          dataUrl = canvas.toDataURL("image/webp", quality);
          if (!dataUrl.startsWith("data:image/webp")) {
            dataUrl = canvas.toDataURL("image/jpeg", quality);
          }
        } catch {
          dataUrl = canvas.toDataURL("image/jpeg", quality);
        }

        // Calculate size in KB
        const head = "data:image/webp;base64,";
        const base64Length = dataUrl.length - (dataUrl.indexOf(",") + 1);
        const sizeBytes = (base64Length * 3) / 4;
        const sizeKb = Math.round(sizeBytes / 1024);

        resolve({
          dataUrl,
          sizeKb,
          width,
          height,
          filename: file.name,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Believable high-resolution campus inspection photos for judge one-click simulation
 */
export const SAMPLE_INSPECTION_PHOTOS = {
  laser: {
    clean: [
      {
        url: "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80",
        label: "Honeycomb Bed & Focal Lens (Clean)",
      },
      {
        url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
        label: "Exhaust Duct & Interlock Switch",
      },
    ],
    damaged: [
      {
        url: "https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?auto=format&fit=crop&w=800&q=80",
        label: "Chipped Acrylic Guide Rail",
      },
    ],
  },
  printer: {
    clean: [
      {
        url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
        label: "PEI Spring Steel Sheet (Isopropanol Cleaned)",
      },
      {
        url: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80",
        label: "Nextruder 0.4mm Brass Nozzle",
      },
    ],
    damaged: [
      {
        url: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80",
        label: "Extruder Filament Jam in Heatbreak",
      },
    ],
  },
  camera: {
    clean: [
      {
        url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
        label: "Full-Frame Sensor Glass & Lens Mount",
      },
      {
        url: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80",
        label: "Pelican Case Interior & Batteries",
      },
    ],
    damaged: [
      {
        url: "https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&w=800&q=80",
        label: "Scratch on Front Filter Element",
      },
    ],
  },
  audio: {
    clean: [
      {
        url: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80",
        label: "Motorized Faders & Preamps Reset",
      },
      {
        url: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80",
        label: "Shure SM7B Shockmount & Cable",
      },
    ],
    damaged: [
      {
        url: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=800&q=80",
        label: "Loose XLR Connector on Channel 2",
      },
    ],
  },
  electronics: {
    clean: [
      {
        url: "https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?auto=format&fit=crop&w=800&q=80",
        label: "Rigol Oscilloscope & Holstered Probes",
      },
      {
        url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
        label: "ESD Workmat & Grounding Wrist Strap",
      },
    ],
    damaged: [
      {
        url: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80",
        label: "Bent Ground Clip on 100MHz Probe",
      },
    ],
  },
};

