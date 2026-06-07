import os
from crewai import Agent
from langchain_google_genai import ChatGoogleGenerativeAI

# Set the Google API Key in environment
os.environ["GOOGLE_API_KEY"] = "AIzaSyBfnr0did-N1Wx_y04ZbO5fK9ce2at1ubc"

# Explicitly create the LLM object for maximum Pydantic stability
llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    verbose=True,
    temperature=0.5,
    google_api_key=os.environ["GOOGLE_API_KEY"]
)

# 1. The Auditor: The "Data Cruncher"
auditor = Agent(
    role='Financial Data Auditor',
    goal='Accurately categorize transactions and identify recurring subscription leaks from Setu JSON data.',
    backstory="""You are a world-class forensic accountant. You can spot a hidden 
    subscription or a duplicate UPI payment from a mile away. You focus strictly on facts.""",
    llm=llm,
    allow_delegation=False,
    verbose=True
)

# 2. The Strategist: The "Math Whiz"
strategist = Agent(
    role='Savings Strategist',
    goal='Apply the 50/30/20 rule to the audited data and calculate a realistic savings target.',
    backstory="""You are a mathematical optimizer. You take raw spending data and 
    transform it into a logical wealth-building plan. You love percentages.""",
    llm=llm,
    allow_delegation=False,
    verbose=True
)

# 3. The Coach: The "User Interface"
coach = Agent(
    role='BachatBuddy Personal Coach',
    goal='Translate complex financial strategy into a friendly, motivating 3-sentence summary for the user.',
    backstory="""You are an empathetic financial mentor. You don't judge; you encourage. 
    Your tone is like a helpful older brother—clear, supportive, and actionable.""",
    llm=llm_model,
    allow_delegation=True,
    verbose=True
)