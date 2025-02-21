import whisper
import torch
import sounddevice as sd
import numpy as np
import wave
import os
import pyttsx3
import requests

def record_audio(filename="input.wav", duration=5, samplerate=44100):
    print("Recording...")
    audio = sd.rec(int(duration * samplerate), samplerate=samplerate, channels=1, dtype=np.int16)
    sd.wait()
    wavefile = wave.open(filename, 'wb')
    wavefile.setnchannels(1)
    wavefile.setsampwidth(2)
    wavefile.setframerate(samplerate)
    wavefile.writeframes(audio.tobytes())
    wavefile.close()
    print("Recording saved.")

def transcribe_audio(filename="input.wav"):
    model = whisper.load_model("base")  # You can use 'tiny', 'small', 'medium', 'large'
    result = model.transcribe(filename)
    return result['text']

def generate_response(text):
    api_url = "https://api-inference.huggingface.co/models/google/gemma-2-27b-it"
    headers = {"Authorization": "Bearer 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"}
    system_prompt = ""
    payload = {"inputs": f"\nUser: {text}\nAssistant:"}
    response = requests.post(api_url, headers=headers, json=payload)
    if response.status_code == 200:
        output = response.json()
        return output[0]['generated_text'] if output else "I'm not sure how to respond to that."
    else:
        return "I'm not sure how to respond to that."

def text_to_speech(text):
    engine = pyttsx3.init()
    engine.say(text)
    engine.runAndWait()

def main():
    record_audio()
    text = transcribe_audio()
    print(f"You said: {text}")
    response = generate_response(text)
    print(f"Assistant: {response}")
    text_to_speech(response)

if __name__ == "__main__":
    main()
