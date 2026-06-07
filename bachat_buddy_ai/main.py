import os
from crewai import Crew, Process
from .agents import auditor, strategist, coach
from .tasks import create_tasks

# Enable Google Embeddings for Memory
os.environ["GOOGLE_API_KEY"] = "AIzaSyBfnr0did-N1Wx_y04ZbO5fK9ce2at1ubc"

# Mock Setu Data for testing
test_data = """
{
  "transactions": [
    {"amount": 500, "type": "DEBIT", "remark": "Netflix Subscription"},
    {"amount": 1200, "type": "DEBIT", "remark": "Zomato Order"},
    {"amount": 80000, "type": "CREDIT", "remark": "Salary March"},
    {"amount": 2500, "type": "DEBIT", "remark": "Electricity Bill"}
  ]
}
"""

def get_crew(data):
    # Assemble the tasks with specific data
    tasks = create_tasks(auditor, strategist, coach, data)
    
    # Assemble the Crew (Ultra-Lean for Pitch Stability)
    return Crew(
        agents=[auditor, strategist, coach],
        tasks=tasks,
        process=Process.sequential,
        memory=False,
        embedder=None,
        verbose=True
    )

def run_analysis(data):
    crew = get_crew(data)
    print("### BACHAT BUDDY CREW STARTING ###")
    return crew.kickoff()

if __name__ == "__main__":
    result = run_analysis(test_data)
    print("\n\n########################")
    print("## FINAL USER MESSAGE ##")
    print("########################\n")
    print(result)