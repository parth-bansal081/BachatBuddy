
const apiKey = "AIzaSyBfnr0did-N1Wx_y04ZbO5fK9ce2at1ubc";
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

async function listModels() {
    try {
        console.log("Fetching models from:", url);
        const response = await fetch(url);
        if (!response.ok) {
            console.error("Error fetching models:", response.status, response.statusText);
            const text = await response.text();
            console.error("Details:", text);
            return;
        }
        const data = await response.json();
        console.log("Available Models:");
        if (data.models) {
            data.models.forEach((m: any) => {
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name} (Supported)`);
                } else {
                    console.log(`- ${m.name} (Not for generateContent)`);
                }
            });
        } else {
            console.log("No models found in response:", data);
        }
    } catch (error) {
        console.error("Execution Error:", error);
    }
}

listModels();
