from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from starlette.concurrency import run_in_threadpool
import sys
import os

# Ensure the library is in the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from bachat_buddy_ai.main import run_analysis

app = FastAPI(title="BachatBuddy AI API")

# CORSMiddleware to allow requests from Vercel frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For sandbox/Vercel compatibility
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class FinanceData(BaseModel):
    setu_json: str

@app.post("/analyze")
async def analyze(data: FinanceData):
    try:
        print(f"Received request to analyze finance data")
        # Trigger the bachat_crew logic via run_analysis in a threadpool
        result = await run_in_threadpool(run_analysis, data.setu_json)
        
        # Return the final 3-sentence summary as a JSON response
        return {
            "summary": str(result),
            "status": "success"
        }
    except Exception as e:
        print(f"Error during analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "BachatBuddy AI API is running"}

if __name__ == "__main__":
    import uvicorn
    # Use port from environment for deployment, fallback to 8000
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
