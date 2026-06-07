import os
import yaml
from crewai import Agent, Task, Crew, Process
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Mock Setu JSON Data for verification
# This mimics a typical transaction list from an Account Aggregator
mock_setu_data = """
{
  "account": {
    "transactions": [
      {"date": "2024-03-01", "description": "NETFLIX", "amount": 499.00, "type": "DEBIT"},
      {"date": "2024-03-02", "description": "SALARY CREDIT - TECH CORP", "amount": 85000.00, "type": "CREDIT"},
      {"date": "2024-03-05", "description": "GPAY-ZOMATO-FOOD", "amount": 450.00, "type": "DEBIT"},
      {"date": "2024-03-10", "description": "HOUSING-RENT-MUMBAI", "amount": 25000.00, "type": "DEBIT"},
      {"date": "2024-03-12", "description": "HOTSTAR-SUBSCRIPTION", "amount": 899.00, "type": "DEBIT"},
      {"date": "2024-03-15", "description": "GPAY-PETROL-HPCL", "amount": 3000.00, "type": "DEBIT"},
      {"date": "2024-03-20", "description": "GPAY-ZOMATO-DINNER", "amount": 650.00, "type": "DEBIT"},
      {"date": "2024-03-25", "description": "GYM-SUBS-ULTIMATE-FIT", "amount": 2500.00, "type": "DEBIT"},
      {"date": "2024-03-28", "description": "LIC-PREMIUM", "amount": 12000.00, "type": "DEBIT"}
    ]
  }
}
"""

def run_bachat_buddy():
    # Load YAML configurations
    print("Loading configurations...")
    with open('config/agents.yaml', 'r') as f:
        agents_config = yaml.safe_load(f)
    with open('config/tasks.yaml', 'r') as f:
        tasks_config = yaml.safe_load(f)

    # Initialize Gemini LLM
    print("Initializing Gemini LLM...")
    llm = ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",
        verbose=True,
        temperature=0.3, # Low temperature for financial analysis precision
        google_api_key=os.getenv("GOOGLE_API_KEY")
    )

    # Initialize Agents
    print("Creating agents...")
    auditor = Agent(
        config=agents_config['auditor'],
        llm=llm,
        verbose=True,
        allow_delegation=False
    )

    strategist = Agent(
        config=agents_config['strategist'],
        llm=llm,
        verbose=True,
        allow_delegation=False
    )

    # Initialize Tasks
    print("Assigning tasks...")
    audit_task = Task(
        config=tasks_config['audit_task'],
        agent=auditor
    )

    planning_task = Task(
        config=tasks_config['planning_task'],
        agent=strategist
    )

    # Create the Sequential Crew
    print("Forming the crew...")
    bachat_crew = Crew(
        agents=[auditor, strategist],
        tasks=[audit_task, planning_task],
        process=Process.sequential,
        verbose=True
    )

    # Kickoff the process
    print("\n🚀 Kickstarting BachatBuddy Finance Engine...")
    result = bachat_crew.kickoff(inputs={'setu_json': mock_setu_data})

    print("\n\n" + "="*50)
    print("      BACHATBUDDY ACTIONABLE SAVINGS PLAN")
    print("="*50 + "\n")
    print(result)

if __name__ == "__main__":
    run_bachat_buddy()
