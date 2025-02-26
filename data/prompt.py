import ollama
import json
import time
import re

# Configuration
themes = [
    {"theme": "Histoire et Civilisations", "subtheme": "Antiquité"},
    {"theme": "Histoire et Civilisations", "subtheme": "Moyen Âge et chevaliers"},
    {"theme": "Histoire et Civilisations", "subtheme": "Révolutions et grands bouleversements"},
    {"theme": "Histoire et Civilisations", "subtheme": "Guerres mondiales et conflits majeurs"},
    {"theme": "Histoire et Civilisations", "subtheme": "Histoire des inventions et découvertes"},
    {"theme": "Histoire et Civilisations", "subtheme": "Histoire des grandes personnalités"},
    # {"theme": "Sciences et Nature", "subtheme": "Animaux et Végétaux"},
    # {"theme": "Sciences et Nature", "subtheme": "Astronomie et Espace"},
    # {"theme": "Sciences et Nature", "subtheme": "Climat et Phénomènes Naturels"},
    # {"theme": "Sciences et Nature", "subtheme": "Mathématiques et Logique"},
    # {"theme": "Sciences et Nature", "subtheme": "Physique et Chimie"},
    # {"theme": "Sciences et Nature", "subtheme": "Médecine et Corps Humain"},
    # {"theme": "Culture Générale et Société", "subtheme": "Littérature et Philosophie"},
    # {"theme": "Culture Générale et Société", "subtheme": "Arts et Peinture"},
    # {"theme": "Culture Générale et Société", "subtheme": "Musique et Compositeurs"},
    # {"theme": "Culture Générale et Société", "subtheme": "Mythes et Légendes"},
    # {"theme": "Culture Générale et Société", "subtheme": "Gastronomie et Traditions Culinaires"},
    # {"theme": "Culture Générale et Société", "subtheme": "Langues et Expressions"},
    # {"theme": "Géographie et Monde", "subtheme": "Villes et Pays"},
    # {"theme": "Géographie et Monde", "subtheme": "Fleuves, Montagnes et Océans"},
    # {"theme": "Géographie et Monde", "subtheme": "Monuments et Patrimoines Mondiaux"},
    # {"theme": "Géographie et Monde", "subtheme": "Paysages et Climat"},
    # {"theme": "Géographie et Monde", "subtheme": "Géopolitique et Relations Internationales"},
    # {"theme": "Géographie et Monde", "subtheme": "Explorateurs et Grandes Découvertes"},
    # {"theme": "Sport et Jeux", "subtheme": "Compétitions Internationales sportives"},
    # {"theme": "Sport et Jeux", "subtheme": "Jeux Olympiques et Records"},
    # {"theme": "Sport et Jeux", "subtheme": "Sports Extrêmes et Insolites"},
    # {"theme": "Sport et Jeux", "subtheme": "Échecs, Puzzles et Casse-Têtes"},
    # {"theme": "Sport et Jeux", "subtheme": "Jeux de Société et Cartes"},
    # {"theme": "Sport et Jeux", "subtheme": "Athlètes Légendaires et Champions"},
    # {"theme": "Culture Pop et Divertissement", "subtheme": "Films et Blockbusters"},
    # {"theme": "Culture Pop et Divertissement", "subtheme": "Séries et Shows TV"},
    # {"theme": "Culture Pop et Divertissement", "subtheme": "Chansons françaises et internationales"},
    # {"theme": "Culture Pop et Divertissement", "subtheme": "Célébrités françaises et internationales"},
    # {"theme": "Culture Pop et Divertissement", "subtheme": "Jeux Vidéos et leurs univers"},
    # {"theme": "Culture Pop et Divertissement", "subtheme": "Culture Internet"},
]

questions_per_theme = 25
difficulties = ["facile","moyenne"]

# Store generated questions to prevent duplicates
unique_questions = set()
quiz_questions = []
history = [{"role": "system", "content": "Tu es un générateur de quiz en français. Trouve des questions uniques. Réponds toujours en français."}]

# Regular expression to extract structured data
pattern = re.compile(
    r"Question\s*:\s*(.*?)\n"
    r"Réponses\s*:\s*\[(.*?)\]\n"
    r"Bonne réponse\s*:\s*(.*?)\n"
    r"Explication\s*:\s*(.*)"
)

# Generate questions
question_id = 1
for difficulty in difficulties:
    for item in themes:
        theme = item["theme"]
        subtheme = item["subtheme"]
        
        print(f"📚 Génération de {questions_per_theme} questions pour {theme} - {subtheme}...")
        
        for _ in range(questions_per_theme):
            prompt = (
                f"Génère une question de quiz sur le thème '{theme}' et le sous-thème '{subtheme}', avec une difficulté '{difficulty}'.\n"
                f"Sois absolument certain que la réponse soit correcte. Ne réponds rien d'autre que le JSON au format suivant :\n"
                f"{{\n"
                f'    "question": "Texte de la question",\n'
                f'    "answers": ["Réponse 1", "Réponse 2", "Réponse 3", "Réponse 4", "Réponse 5"],\n'
                f'    "correct": "Réponse correcte",\n'
                f'    "explanation": "Explication détaillée"\n'
                f"}}"
            )

            # Maintain conversation history
            history.append({"role": "user", "content": prompt})
            if len(history) > 10:  
                history = history[-10:]  # Keep only the last 10 messages

            # Get response from Mistral
            response = ollama.chat(model="phi4", messages=history)
            response_text = "{"+response["message"]["content"].strip().split("{")[-1].strip().split("}")[0].strip()+"}"
            print("💬", response_text)

            # Ensure uniqueness
            if response_text in unique_questions:
                print("⚠️ Question en double détectée, en générant une nouvelle...")
                continue  # Skip and retry
            
            unique_questions.add(response_text)
            history.append({"role": "assistant", "content": response_text})

            # Try to parse JSON response
            try:
                question_data = json.loads(response_text)
                quiz_entry = {
                    "id": question_id,
                    "theme": theme,
                    "subtheme": subtheme,
                    "question": question_data["question"],
                    "answers": question_data["answers"],
                    "correct": question_data["correct"],
                    "difficulty": difficulty,
                    "explanation": question_data["explanation"]
                }
                quiz_questions.append(quiz_entry)
                question_id += 1
            except json.JSONDecodeError:
                print("⚠️ Erreur JSON, régénération de la question...")
                continue  # Retry if JSON is invalid

            time.sleep(1)  # Avoid overwhelming the API

    # Save to JSON file
    with open("quiz_questions_"+difficulty+".json", "w", encoding="utf-8") as f:
        json.dump(quiz_questions, f, indent=4, ensure_ascii=False)

    print("✅ Génération terminée ! Les questions ont été enregistrées dans 'quiz_questions"+difficulty+".json'.")

