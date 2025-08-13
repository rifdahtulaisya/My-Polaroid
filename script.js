// Di dalam DOMContentLoaded atau bagian atas script
frameOptions.forEach(frame => {
    frame.addEventListener('click', function() {
        // Hapus active class dari semua frame
        frameOptions.forEach(f => f.classList.remove('active'));
        
        // Tambahkan active class ke frame yang dipilih
        this.classList.add('active');
        
        selectedFrame = this.getAttribute('data-frame');
        showNotification(frameMessages[selectedFrame]);
        
        // Sembunyikan placeholder, tampilkan opsi kamera/upload
        cameraPlaceholder.classList.add('hidden');
        cameraSection.classList.remove('hidden');
        
        // Mulai kamera
        startCamera();
    });
});

// Add these variables at the top with other variable declarations
const uploadBtn = document.getElementById('uploadBtn');
const uploadSection = document.getElementById('uploadSection');
const uploadPreview = document.getElementById('uploadPreview');
const selectFileBtn = document.getElementById('selectFileBtn');
const useCameraBtn = document.getElementById('useCameraBtn');
const fileInput = document.getElementById('fileInput');

// Add this event listener with other event listeners
uploadBtn.addEventListener('click', () => {
    cameraSection.classList.add('hidden');
    uploadSection.classList.remove('hidden');
    // Stop camera if it's running
    if (cameraView.srcObject) {
        cameraView.srcObject.getTracks().forEach(track => track.stop());
    }
});

useCameraBtn.addEventListener('click', () => {
    uploadSection.classList.add('hidden');
    cameraSection.classList.remove('hidden');
    startCamera();
});

selectFileBtn.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            uploadPreview.src = event.target.result;
            processUploadedImage();
        };
        reader.readAsDataURL(file);
    }
});

function processUploadedImage() {
    if (!selectedFrame) return;
    
    const frameImg = new Image();
    frameImg.crossOrigin = "anonymous";
    frameImg.onload = function() {
        // Set canvas size to match frame image size
        resultCanvas.width = frameImg.width;
        resultCanvas.height = frameImg.height;
        
        // Calculate aspect ratio and positioning
        const uploadedImg = new Image();
        uploadedImg.src = uploadPreview.src;
        
        uploadedImg.onload = function() {
            const imgAspect = uploadedImg.width / uploadedImg.height;
            const frameAspect = frameImg.width / frameImg.height;
            
            let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
            
            if (imgAspect > frameAspect) {
                // Image is wider than frame - fit to height
                drawHeight = frameImg.height;
                drawWidth = uploadedImg.width * (frameImg.height / uploadedImg.height);
                offsetX = (frameImg.width - drawWidth) / 2;
            } else {
                // Image is taller than frame - fit to width
                drawWidth = frameImg.width;
                drawHeight = uploadedImg.height * (frameImg.width / uploadedImg.width);
                offsetY = (frameImg.height - drawHeight) / 2;
            }
            
            // Draw the photo first (background)
            ctx.drawImage(uploadedImg, offsetX, offsetY, drawWidth, drawHeight);
            
            // Then draw the frame on top (foreground)
            ctx.drawImage(frameImg, 0, 0);
            
            // Show result
            uploadSection.classList.add('hidden');
            resultSection.classList.remove('hidden');
        };
    };
    frameImg.src = `frames/${selectedFrame}.png`;
}

// Modify the retakeBtn event listener to handle both camera and upload flows
retakeBtn.addEventListener('click', () => {
    resultSection.classList.add('hidden');
    
    // Check which mode we were in before
    if (uploadPreview.src && uploadPreview.src !== '') {
        uploadSection.classList.remove('hidden');
    } else {
        cameraSection.classList.remove('hidden');
        startCamera();
    }
});

// Di awal script.js tambahkan ini:
document.addEventListener('DOMContentLoaded', () => {
  // Cek fitur mediaDevices support
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showNotification("Browser Anda tidak mendukung akses kamera");
      cameraPlaceholder.querySelector('.placeholder-text').textContent = 
          "Browser tidak mendukung fitur kamera. Gunakan Chrome/Firefox terbaru.";
      return;
  }
  
  // Cek apakah di localhost atau HTTPS
  if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
      showNotification("Kamera hanya bekerja di HTTPS atau localhost");
      console.warn("Kamera membutuhkan HTTPS atau localhost");
  }
});

// Variabel Global
let selectedFrame = null;
const frameOptions = document.querySelectorAll('.frame-option');
const cameraPlaceholder = document.getElementById('cameraPlaceholder');
const cameraSection = document.getElementById('cameraSection');
const resultSection = document.getElementById('resultSection');
const cameraView = document.getElementById('cameraView');
const captureBtn = document.getElementById('captureBtn');
const retakeBtn = document.getElementById('retakeBtn');
const downloadBtn = document.getElementById('downloadBtn');
const resultCanvas = document.getElementById('resultCanvas');
const notification = document.getElementById('notification');
const ctx = resultCanvas.getContext('2d');

// Notifikasi
const frameMessages = {
    frame1: "Yeay! Bingkai lucu dipilih~ 💕",
    frame2: "Warnanya lucu banget! 🌈",
    frame3: "Ceri-ceri cantik! 🌸",
    frame4: "Vintage vibes! 📻",
    frame5: "Kawaii desu ne~(≧◡≦)",
    frame6: "Bingkai cantik untuk orang cantik~♡"
};

// 1. Pilih Bingkai
frameOptions.forEach(frame => {
    frame.addEventListener('click', () => {
        // Remove active class from all frames
        frameOptions.forEach(f => f.classList.remove('active'));
        
        // Add active class to selected frame
        frame.classList.add('active');
        
        selectedFrame = frame.getAttribute('data-frame');
        showNotification(frameMessages[selectedFrame]);
        cameraPlaceholder.classList.add('hidden');
        cameraSection.classList.remove('hidden');
        resultSection.classList.add('hidden');
        startCamera();
    });
});

// Ganti kode startCamera() dengan:
async function startCamera() {
    try {
      const constraints = {
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      console.log("Attempting to get media with constraints:", constraints);
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
        .catch(err => {
          console.error("getUserMedia error:", err);
          throw err;
        });
      
      console.log("Got stream:", stream);
      cameraView.srcObject = stream;
      
      return new Promise((resolve) => {
        cameraView.onloadedmetadata = () => {
          console.log("Video metadata loaded");
          cameraView.play().then(resolve).catch(console.error);
        };
      });
    } catch (err) {
      console.error("Camera error:", err.name, err.message);
      showNotification(`Error: ${err.message}`);
      cameraPlaceholder.classList.remove('hidden');
    }
  }



// 3. Take Foto
captureBtn.addEventListener('click', () => {
    if (!selectedFrame) return;
    
    const frameImg = new Image();
    frameImg.crossOrigin = "anonymous";
    frameImg.onload = function() {
        // Set canvas size to match frame image size
        resultCanvas.width = frameImg.width;
        resultCanvas.height = frameImg.height;
        
        // Calculate aspect ratio and positioning
        const videoAspect = cameraView.videoWidth / cameraView.videoHeight;
        const frameAspect = frameImg.width / frameImg.height;
        
        let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
        
        if (videoAspect > frameAspect) {
            // Video is wider than frame - fit to height
            drawHeight = frameImg.height;
            drawWidth = cameraView.videoWidth * (frameImg.height / cameraView.videoHeight);
            offsetX = (frameImg.width - drawWidth) / 2;
        } else {
            // Video is taller than frame - fit to width
            drawWidth = frameImg.width;
            drawHeight = cameraView.videoHeight * (frameImg.width / cameraView.videoWidth);
            offsetY = (frameImg.height - drawHeight) / 2;
        }
        
        // Draw the photo first (background)
        ctx.drawImage(cameraView, offsetX, offsetY, drawWidth, drawHeight);
        
        // Then draw the frame on top (foreground)
        ctx.drawImage(frameImg, 0, 0);
        
        // Tampilkan hasil
        cameraSection.classList.add('hidden');
        resultSection.classList.remove('hidden');
        
        // Stop kamera
        cameraView.srcObject.getTracks().forEach(track => track.stop());
    };
    frameImg.src = `frames/${selectedFrame}.png`;
});

// 4. Tombol Ambil Lagi
retakeBtn.addEventListener('click', () => {
    resultSection.classList.add('hidden');
    cameraSection.classList.remove('hidden');
    startCamera();
});

// 5. Download Foto
downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = `polaroid_${selectedFrame}_${Date.now()}.png`;
    link.href = resultCanvas.toDataURL('image/png');
    link.click();
    showNotification("Foto tersimpan! 🎉");
});

// Fungsi Notifikasi
// Fungsi Notifikasi
function showNotification(message) {
  notification.textContent = message;
  notification.classList.remove('hidden');
  notification.classList.add('show'); // Add this line
  setTimeout(() => {
      notification.classList.remove('show');
      notification.classList.add('hidden');
  }, 3000);
}

// Inisialisasi
showNotification("Pilih bingkai favoritmu dulu yaa~ 😊");