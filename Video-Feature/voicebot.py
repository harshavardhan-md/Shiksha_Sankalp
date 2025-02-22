import torch
import whisper
from transformers import pipeline
from fastapi import FastAPI, UploadFile, File
import soundfile as sf
import io
import torchaudio
import pyttsx3

# Load ASR Model (Speech-to-Text)
asr_model = whisper.load_model("small")

# Load NLP Model (Conversational AI) - Using text-generation instead of conversational
nlp_pipeline = pipeline("text-generation", model="HuggingFaceH4/zephyr-7b-beta")

# Load TTS Model (Text-to-Speech)
def text_to_speech(text):
    engine = pyttsx3.init()
    engine.save_to_file(text, "output.wav")
    engine.runAndWait()
    return "output.wav"

# Initialize FastAPI
app = FastAPI()

@app.post("/process_speech/")
async def process_speech(file: UploadFile = File(...)):
    audio_bytes = await file.read()
    with io.BytesIO(audio_bytes) as f:
        speech, sr = sf.read(f)
    
    # Convert speech to text
    text = asr_model.transcribe(audio_bytes)["text"]
    
    # Process text with Conversational AI
    response_text = nlp_pipeline(text, max_length=100)[0]["generated_text"]
    
    # Convert response to speech
    speech_output = text_to_speech(response_text)
    return {"text": text, "response": response_text, "speech_output": speech_output}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
