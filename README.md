# FurryMatcher

FurryMatcher is an AI-supported pet adoption matching system developed as part of an MSc Computer Science project at Queen Mary University of London.

The system aims to improve pet adoption by helping users find cats and dogs that match their preferences and lifestyle.

## Key Features

- Conversational AI assistant called Adam
- Natural language preference extraction
- Personalised pet recommendations
- Cat and dog breed image recognition
- Lifestyle matching questionnaire
- Pet browsing and filtering
- Like and save functionality
- User authentication and profiles
- Pet registration and surrender support

## Technologies

### Frontend
- React Native
- Expo
- TypeScript / JavaScript
- Expo Router

### Backend
- Python
- FastAPI
- spaCy
- Ollama
- Gemma
- TensorFlow / Keras
- MobileNetV2

### Database and Authentication
- Supabase

## Project Structure

`frontend/` contains the React Native and Expo frontend application.

`main.py` contains the main FastAPI backend and matching logic.

`breed_model_v2.keras` contains the trained image classification model.

`pets.json` contains pet information used by the system.

`train_model.py` contains the image recognition model training code.

# FurryMatcher

FurryMatcher is an AI-supported pet adoption matching system developed as part of an MSc Computer Science project at Queen Mary University of London.

The system aims to improve pet adoption by helping users find cats and dogs that match their preferences and lifestyle.

## Key Features

- Conversational AI assistant called Adam
- Natural language preference extraction
- Personalised pet recommendations
- Cat and dog breed image recognition
- Lifestyle matching questionnaire
- Pet browsing and filtering
- Like and save functionality
- User authentication and profiles
- Pet registration and surrender support

## Technologies

### Frontend

- React Native
- Expo
- TypeScript / JavaScript
- Expo Router

### Backend

- Python
- FastAPI
- spaCy
- Ollama
- Gemma
- TensorFlow / Keras
- MobileNetV2

### Database and Authentication

- Supabase

## Project Structure

`frontend/` contains the React Native and Expo frontend application.

`main.py` contains the main FastAPI backend and matching logic.

`breed_model_v2.keras` contains the trained image classification model.

`pets.json` contains pet information used by the system.

`train_model.py` contains the image recognition model training code.

`prepare_dataset.py` contains dataset preparation code.

## Running the Backend

From the main FurryMatcher directory:

```bash
uvicorn main:app --reload
```

The backend will run locally using FastAPI.

Ollama must also be installed and running locally for the conversational AI functionality.

## Running the Frontend

Open a second Terminal window and enter:

```bash
cd frontend
npm install
npx expo start
```

Follow the Expo instructions shown in the Terminal to open the application.

## Image Recognition

FurryMatcher uses a TensorFlow/Keras image classification model based on MobileNetV2. Users can upload a photograph of a cat or dog and the system predicts its breed.

The trained model is stored as:

```text
breed_model_v2.keras
```

## AI and NLP

The conversational assistant, Adam, uses a locally running Gemma model through Ollama.

spaCy is used to extract adoption preferences from natural language, including characteristics such as species, breed, age and energy level.

These preferences are used by the system to support personalised pet matching.

## Notes

Some components require local services and dependencies, including Ollama and the required Python and Node.js packages.

Large training datasets and uploaded user images are excluded from this repository.
