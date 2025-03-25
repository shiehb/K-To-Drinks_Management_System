export async function getCroppedImg(imageSrc, cropAreaPixels) {
    const image = new Image();
    image.src = imageSrc;
  
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
    });
  
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
  
    canvas.width = cropAreaPixels.width;
    canvas.height = cropAreaPixels.height;
  
    ctx.drawImage(
      image,
      cropAreaPixels.x,
      cropAreaPixels.y,
      cropAreaPixels.width,
      cropAreaPixels.height,
      0,
      0,
      canvas.width,
      canvas.height
    );
  
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Canvas is empty"));
            return;
          }
          resolve(URL.createObjectURL(blob));
        },
        "image/jpeg",
        0.9 // Quality
      );
    });
  }