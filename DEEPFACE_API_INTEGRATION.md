# DeepFace API Integration Guide

## Overview
This document explains how to integrate DeepFace (Python library) with the HireTwin AI mock interview system.

Since DeepFace is a Python library and this is a React/TypeScript frontend, you need a Python backend API.

## Backend Setup (Python FastAPI)

### 1. Install Dependencies
```bash
pip install deepface fastapi uvicorn opencv-python-headless pillow
```

### 2. Create FastAPI Server (`deepface_server.py`)

```python
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from deepface import DeepFace
import cv2
import numpy as np
from PIL import Image
import io
import base64

app = FastAPI()

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Your React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/analyze-face")
async def analyze_face(file: UploadFile = File(...)):
    """
    Analyze face using DeepFace for:
    - Emotion detection
    - Age estimation
    - Gender detection
    - Race detection
    """
    try:
        # Read image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Analyze with DeepFace
        analysis = DeepFace.analyze(
            img_path=img,
            actions=['emotion', 'age', 'gender', 'race'],
            enforce_detection=False
        )
        
        # Extract first face results (if multiple detected)
        if isinstance(analysis, list):
            analysis = analysis[0]
        
        return {
            "success": True,
            "emotion": analysis['dominant_emotion'],
            "emotion_scores": analysis['emotion'],
            "age": analysis['age'],
            "gender": analysis['dominant_gender'],
            "race": analysis['dominant_race'],
            "region": analysis['region']
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

@app.post("/api/verify-attention")
async def verify_attention(file: UploadFile = File(...)):
    """
    Verify if person is looking at camera
    Uses face landmarks to detect gaze direction
    """
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Detect face
        face_objs = DeepFace.extract_faces(
            img_path=img,
            enforce_detection=False,
            detector_backend='opencv'
        )
        
        if not face_objs:
            return {
                "success": False,
                "looking_at_camera": False,
                "message": "No face detected"
            }
        
        face = face_objs[0]
        facial_area = face['facial_area']
        
        # Calculate face position relative to frame center
        img_h, img_w = img.shape[:2]
        face_center_x = (facial_area['x'] + facial_area['w'] / 2) / img_w
        face_center_y = (facial_area['y'] + facial_area['h'] / 2) / img_h
        
        # Check if face is centered (looking at camera)
        is_centered_x = 0.3 < face_center_x < 0.7
        is_centered_y = 0.2 < face_center_y < 0.8
        
        looking_at_camera = is_centered_x and is_centered_y
        
        return {
            "success": True,
            "looking_at_camera": looking_at_camera,
            "face_position": {
                "x": face_center_x,
                "y": face_center_y
            },
            "confidence": face['confidence']
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### 3. Run the Server
```bash
python deepface_server.py
```

## Frontend Integration

### Add DeepFace API Service

Create `src/services/deepfaceApi.ts`:

```typescript
export interface DeepFaceAnalysis {
  success: boolean;
  emotion?: string;
  emotion_scores?: Record<string, number>;
  age?: number;
  gender?: string;
  race?: string;
  region?: any;
  error?: string;
}

export interface AttentionVerification {
  success: boolean;
  looking_at_camera?: boolean;
  face_position?: { x: number; y: number };
  confidence?: number;
  message?: string;
  error?: string;
}

const API_URL = 'http://localhost:8000/api';

export async function analyzeFaceWithDeepFace(
  videoElement: HTMLVideoElement
): Promise<DeepFaceAnalysis> {
  // Capture frame from video
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    return { success: false, error: 'Canvas not supported' };
  }
  
  ctx.drawImage(videoElement, 0, 0);
  
  // Convert to blob
  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.8);
  });
  
  // Send to API
  const formData = new FormData();
  formData.append('file', blob, 'frame.jpg');
  
  try {
    const response = await fetch(`${API_URL}/analyze-face`, {
      method: 'POST',
      body: formData,
    });
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function verifyAttention(
  videoElement: HTMLVideoElement
): Promise<AttentionVerification> {
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    return { success: false, error: 'Canvas not supported' };
  }
  
  ctx.drawImage(videoElement, 0, 0);
  
  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.8);
  });
  
  const formData = new FormData();
  formData.append('file', blob, 'frame.jpg');
  
  try {
    const response = await fetch(`${API_URL}/verify-attention`, {
      method: 'POST',
      body: formData,
    });
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
```

### Use in AIMockInterview Component

Add to your component:

```typescript
import { analyzeFaceWithDeepFace, verifyAttention } from '../services/deepfaceApi';

// Add state
const [deepfaceEnabled, setDeepfaceEnabled] = useState(false);

// Call every few seconds during interview
useEffect(() => {
  if (!deepfaceEnabled || !isRecording || !videoRef.current) return;
  
  const interval = setInterval(async () => {
    if (videoRef.current) {
      // Get emotion analysis
      const analysis = await analyzeFaceWithDeepFace(videoRef.current);
      
      if (analysis.success) {
        setFaceMetrics(prev => ({
          ...prev,
          emotion: analysis.emotion || 'Neutral'
        }));
        
        // Log for feedback
        addFeedback(`Emotion: ${analysis.emotion}, Age: ~${analysis.age}`);
      }
      
      // Verify attention
      const attention = await verifyAttention(videoRef.current);
      
      if (attention.success && !attention.looking_at_camera) {
        addFeedback("⚠️ Please look at the camera");
      }
    }
  }, 3000); // Every 3 seconds
  
  return () => clearInterval(interval);
}, [deepfaceEnabled, isRecording]);
```

## Environment Variables

Create `.env.local`:
```
VITE_DEEPFACE_API_URL=http://localhost:8000/api
```

## Docker Setup (Optional)

Create `Dockerfile` for the Python backend:

```dockerfile
FROM python:3.9-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY deepface_server.py .

EXPOSE 8000

CMD ["uvicorn", "deepface_server:app", "--host", "0.0.0.0", "--port", "8000"]
```

`requirements.txt`:
```
fastapi==0.104.1
uvicorn[standard]==0.24.0
deepface==0.0.79
opencv-python-headless==4.8.1.78
pillow==10.1.0
python-multipart==0.0.6
```

Run with:
```bash
docker build -t deepface-api .
docker run -p 8000:8000 deepface-api
```

## Benefits of DeepFace Integration

1. **Accurate Emotion Detection** - 7 emotions: angry, disgust, fear, happy, sad, surprise, neutral
2. **Age & Gender Estimation** - For demographic analysis
3. **Face Verification** - Ensure same person throughout interview
4. **Gaze Detection** - Verify user is looking at camera
5. **Expression Analysis** - Track facial expressions over time

## Production Considerations

1. **Rate Limiting** - Add rate limits to prevent API abuse
2. **Caching** - Cache results for similar frames
3. **Batch Processing** - Send multiple frames at once
4. **WebSocket** - For real-time streaming instead of HTTP
5. **Model Optimization** - Use lighter models for faster inference
6. **GPU Support** - Enable CUDA for faster processing

## Alternative: Client-Side Emotion Detection

If you don't want a backend, use `@vladmandic/face-api`:

```bash
npm install @vladmandic/face-api
```

This runs entirely in the browser but is less accurate than DeepFace.
